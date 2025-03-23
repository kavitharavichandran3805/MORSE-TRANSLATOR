from django.shortcuts import render
import requests
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import UserSerializers
from django.contrib.auth import authenticate,login,logout
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.contrib.sessions.models import Session 
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_for_user(user):
    refresh=RefreshToken.for_user(user)
    return {
        "refresh":str(refresh),
        "access":str(refresh.access_token)
    }
class LogoutAPI(APIView):

    permission_classes=[IsAuthenticated]

    def post(self,request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"status": True, "message": "Logout successful"})
        except Exception as e:
            return Response({"status": False, "message": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        


class SignupAPI(APIView):

    def post(self,request):
        print("inside the signup api")
        print("Request data:",request.data)
        data=request.data
        serializers=UserSerializers(data=data)
        if not serializers.is_valid():
            return Response({
                'status':False,
                'message':serializers.errors
            },status.HTTP_400_BAD_REQUEST)
        user=serializers.save()
        token=get_tokens_for_user(user)
        return Response({'status':True,'message':'Sign up was successful','tokens':token})

class SampleSignupAPI(APIView):
    def delete(self,request):
        data=request.data
        email=data.get('email')
        try:
            user=User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'status': False, 'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({"status":True,"message":"user successfully deleted"})
    
class UserDetailsAPI(APIView):

    permission_classes=[IsAuthenticated]
    def get(self,request):
        user=request.user
        return Response({
            'status': True,
            'user': {
                'username': user.username,
                'email': user.email,
            }
        }, status=status.HTTP_200_OK)

        
def get_csrf_token(request):
    return JsonResponse({"token":get_token(request)})

class EmailAPI(APIView):

    permission_classes=[IsAuthenticated]

    def post(self,request):
        data=request.data
        issue_data=data.get("issue")
        print(issue_data)
        user=request.user
        print(user.email)
        email=user.email
        if not all([email,issue_data]):
            return Response({'status':False,'message':'Missing Parameter'})

        send_mail(
            'No subject',
            issue_data,
            email,
            [settings.DEFAULT_TO_EMAIL,'anithaanbu7903@gmail.com'],
            fail_silently=False

        )
        return Response({"status":True,"message":"Email successfully sent"})

class LoginAPI(APIView):

    def get(self,request):
        users=User.objects.all()
        if not users.exists():
            return Response({"status":False,"message":"No user exist"})
        serializers=UserSerializers(users,many=True)
        return Response({"status":True,"data":serializers.data})

    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'status': False, 'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        user = authenticate(username=user.username, password=password)
        if user is not None:
            tokens = get_tokens_for_user(user)
            return Response({'status': True, 'message': 'Login successful', 'tokens': tokens}) 
        return Response({'status': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


