from django.urls import re_path
from backend.consumers import MorseConsumer

websocket_patterns=[
    re_path(r'ws/morse/$',MorseConsumer.as_asgi())
]