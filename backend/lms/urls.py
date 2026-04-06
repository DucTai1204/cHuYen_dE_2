from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KhoaHocViewSet, BaiGiangViewSet, DangKyHocViewSet, ChuongViewSet, 
    TienDoBaiGiangViewSet, DanhGiaKhoaHocViewSet, TinNhanViewSet,
    DanhGiaNhaTuyenDungViewSet, TuyenDungViewSet,
    CauHoiViewSet, LuaChonViewSet, KetQuaQuizViewSet
)

router = DefaultRouter()
router.register(r'khoa-hoc', KhoaHocViewSet)
router.register(r'chuong', ChuongViewSet)
router.register(r'bai-giang', BaiGiangViewSet)
router.register(r'dang-ky-hoc', DangKyHocViewSet)
router.register(r'tien-do-bai', TienDoBaiGiangViewSet, basename='tien-do-bai')
router.register(r'danh-gia', DanhGiaKhoaHocViewSet, basename='danh-gia')
router.register(r'tin-nhan', TinNhanViewSet, basename='tin-nhan')
router.register(r'danh-gia-ntd', DanhGiaNhaTuyenDungViewSet, basename='danh-gia-ntd')
router.register(r'tuyen-dung', TuyenDungViewSet, basename='tuyen-dung')
router.register(r'cau-hoi', CauHoiViewSet, basename='cau-hoi')
router.register(r'lua-chon', LuaChonViewSet, basename='lua-chon')
router.register(r'ket-qua-quiz', KetQuaQuizViewSet, basename='ket-qua-quiz')

urlpatterns = [
    path('', include(router.urls)),
]
