from django.urls import path
from .views import proctoring_webhook

urlpatterns = [
    path('webhook/', proctoring_webhook, name='ai-webhook'),
]
