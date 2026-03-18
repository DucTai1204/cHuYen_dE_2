from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KhoaHocViewSet, BaiGiangViewSet, DangKyHocViewSet, ChuongViewSet, TienDoBaiGiangViewSet

router = DefaultRouter()
router.register(r'khoa-hoc', KhoaHocViewSet)
router.register(r'chuong', ChuongViewSet)
router.register(r'bai-giang', BaiGiangViewSet)
router.register(r'dang-ky-hoc', DangKyHocViewSet)
router.register(r'tien-do-bai', TienDoBaiGiangViewSet, basename='tien-do-bai')

urlpatterns = [
    path('', include(router.urls)),
]
