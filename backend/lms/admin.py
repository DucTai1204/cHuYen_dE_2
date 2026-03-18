from django.contrib import admin
from .models import KyNang, KhoaHoc, BaiGiang, KyNangKhoaHoc, DangKyHoc

admin.site.register(KyNang)
admin.site.register(KhoaHoc)
admin.site.register(BaiGiang)
admin.site.register(KyNangKhoaHoc)
admin.site.register(DangKyHoc)
