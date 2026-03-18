from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MauChungChiViewSet, ChungChiSoViewSet, xac_thuc_chung_chi

router = DefaultRouter()
router.register(r'mau', MauChungChiViewSet)
router.register(r'danh-sach', ChungChiSoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('verify/<str:uuid>/', xac_thuc_chung_chi, name='verify-cert'),
]
