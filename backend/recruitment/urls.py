from django.urls import path
from .views import TraCuuUngVienView

urlpatterns = [
    path('tra-cuu/', TraCuuUngVienView.as_view(), name='tra-cuu-ung-vien'),
]
