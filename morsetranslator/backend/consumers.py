import asyncio
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import cv2
import dlib
import numpy as np
from scipy.spatial import distance
import time


LEFT_EYE = [36, 37, 38, 39, 40, 41]
RIGHT_EYE = [42, 43, 44, 45, 46, 47]
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(r"D:\MORSE-TRANSLATOR\shape_predictor_68_face_landmarks.dat")
threshold = 0.22
blink_threshold = 0.3
letter_space_threshold = 0.8
word_space_threshold = 1.5
eye_closed = False

MORSE_CODE_DICT = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',  
    'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
    'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',  
    'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',  
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',  
    'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',  
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',  
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '/': '-..-.'
}


class MorseConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.cap = cv2.VideoCapture(0)
        self.eye_open_start = time.time()
        self.letters = ""
        self.running = False
        self.eye_closed = False
        self.blink_start = None
        self.last_sent_word = ""
        self.current_word = ""

    async def disconnect(self, code):
        self.running = False
        self.cap.release()
        cv2.destroyAllWindows()

    async def receive(self, text_data=None):
        data = json.loads(text_data)
        command = data.get("command")

        if command == "start":
            self.running = True
            self.last_sent_word = ""
            self.current_word = ""
            self.translate_task = asyncio.create_task(self.translate())
        else:
            self.running = False
            self.cap.release()
            cv2.destroyAllWindows()
            await self.send(text_data=json.dumps({"status": "stopped"}))

    async def translate(self):
        self.letters = ""
        self.current_word = ""
        
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                break
            
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = detector(gray)
            
            should_send_update = False
            new_letter = None

            for face in faces:
                landmark = predictor(gray, face)
                left_eye = np.array([(landmark.part(n).x, landmark.part(n).y) for n in LEFT_EYE])
                right_eye = np.array([(landmark.part(n).x, landmark.part(n).y) for n in RIGHT_EYE])
                
                left_ear = self.calculate_ear(left_eye)
                right_ear = self.calculate_ear(right_eye)
                avg_ear = (left_ear + right_ear) / 2

                if avg_ear < threshold:
                    if not self.eye_closed:
                        self.eye_closed = True
                        self.blink_start = time.time()
                else:
                    if self.eye_closed:
                        blink_duration = time.time() - self.blink_start
                        self.eye_closed = False
                        self.eye_open_start = time.time()  

                        if blink_duration < blink_threshold:
                            self.letters += '.'
                        else:
                            self.letters += '-'

            eye_open_duration = time.time() - self.eye_open_start

            if eye_open_duration > letter_space_threshold and self.letters:
                for character, code in MORSE_CODE_DICT.items(): 
                    if code == self.letters:
                        self.current_word += character
                        new_letter = character
                        should_send_update = True
                        print(character, end='', flush=True)
                        break
                self.letters = ''

            if eye_open_duration > word_space_threshold and self.current_word:
                print(" ", end='', flush=True)
                self.current_word += " "
                should_send_update = True

            _, buffer = cv2.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')

            if self.running:
                if should_send_update and self.current_word != self.last_sent_word:
                    update_data = {
                        "translation": self.current_word if new_letter else " ",
                        "frame": frame_base64,
                        "newLetter": True if new_letter else False
                    }
                    await self.send(text_data=json.dumps(update_data))
                    self.last_sent_word = self.current_word
                else:
                    await self.send(text_data=json.dumps({
                        "frame": frame_base64
                    }))

            await asyncio.sleep(0.1)

    def calculate_ear(self, eye_arr):
        dis1 = distance.euclidean(eye_arr[1], eye_arr[5])
        dis2 = distance.euclidean(eye_arr[2], eye_arr[4])
        dis3 = distance.euclidean(eye_arr[0], eye_arr[3])
        return (dis1 + dis2) / (2 * dis3)