from django.urls import path
from backend.views import LoginAPI,UserDetailsAPI,SignupAPI,UserDetailsAPI,LogoutAPI,SampleSignupAPI,EmailAPI,get_csrf_token

urlpatterns=[
    path('login/',LoginAPI.as_view()),
    path('signup/',SignupAPI.as_view()),
    path('userdetails/',UserDetailsAPI.as_view()),
    path('logout/',LogoutAPI.as_view()),
    path('sampledelete/',SampleSignupAPI.as_view()),
    path('issue_email/',EmailAPI.as_view()),
    path('csrf/',get_csrf_token),
    
]