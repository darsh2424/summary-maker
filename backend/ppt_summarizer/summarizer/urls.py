from django.urls import path
from . import views

urlpatterns = [
    path("api/chat/", views.chat_mode, name="chat_mode"),
    path("api/generate-ppt/", views.ppt_mode, name="ppt_mode"),
]
