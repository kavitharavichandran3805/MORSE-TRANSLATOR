import cv2
import dlib
import numpy as np
from scipy.spatial import distance
import time

def calculate_ear(ear_arr):
    dis1 = distance.euclidean(ear_arr[1], ear_arr[5])
    dis2 = distance.euclidean(ear_arr[2], ear_arr[4])
    dis3 = distance.euclidean(ear_arr[0], ear_arr[3])
    ear_value = (dis1 + dis2) / (2 * dis3)
    return ear_value

cap = cv2.VideoCapture(0)

LEFT_EYE = [36, 37, 38, 39, 40, 41]
RIGHT_EYE = [42, 43, 44, 45, 46, 47]
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(r"C:\Users\Dell\Desktop\DESKTOP_FOLDER\MORSE CODE\morseenv\shape_predictor_68_face_landmarks.dat")

eye_closed = False
threshold = 0.22
blink_threshold = 0.3
letter_space_threshold = 0.8
word_space_threshold = 1.5

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

predicted_words = []
words = ''
letters = ''
eye_open_start = time.time()  

while True:
    ret, frame = cap.read()
    if not ret:
        break
    cv2.imshow("Camera", frame)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

    for face in faces:
        landmark = predictor(gray, face)
        left_eye = np.array([(landmark.part(n).x, landmark.part(n).y) for n in LEFT_EYE])
        right_eye = np.array([(landmark.part(n).x, landmark.part(n).y) for n in RIGHT_EYE])
        
        left_ear = calculate_ear(left_eye)
        right_ear = calculate_ear(right_eye)
        avg_ear = (left_ear + right_ear) / 2

        if avg_ear < threshold:
            if not eye_closed:
                eye_closed = True
                blink_start = time.time()
        else:
            if eye_closed:
                blink_duration = time.time() - blink_start
                eye_closed = False
                eye_open_start = time.time()  
                
                if blink_duration < blink_threshold:
                    print("dot")
                    letters += '.'
                else:
                    print("dash")
                    letters += '-'

    eye_open_duration = time.time() - eye_open_start

    if eye_open_duration > letter_space_threshold and letters:
        print("letter space")
        for character, code in MORSE_CODE_DICT.items(): 
            if code == letters:
                words += character
                break
        print("the code is :"+letters)
        print("the letter detected is "+words)
        letters = ''

    if eye_open_duration > word_space_threshold and words:
        print("word space")
        predicted_words.append(words)
        print("the word is "+words)
        words = ''

    if cv2.waitKey(1) == ord('q'):
        break

print(predicted_words)
cap.release()
cv2.destroyAllWindows()
