from django.db import models
from lms.models import KhoaHoc, DangKyHoc

class MauChungChi(models.Model):
    id_mau = models.AutoField(primary_key=True)
    id_khoa_hoc = models.ForeignKey(KhoaHoc, on_delete=models.CASCADE, related_name='mau_chung_chi')
    ten_mau = models.CharField(max_length=255)
    hinh_nen_url = models.CharField(max_length=500, blank=True, null=True)
    vi_tri_chu_ky = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.ten_mau} - Khóa: {self.id_khoa_hoc.ten_khoa_hoc}"

class ChungChiSo(models.Model):
    TRANG_THAI_CHOICES = [
        ('HieuLuc', 'Hiệu lực'),
        ('DaThuHoi', 'Đã thu hồi')
    ]

    ma_uuid_chung_chi = models.CharField(max_length=100, primary_key=True)
    id_dang_ky = models.ForeignKey(DangKyHoc, on_delete=models.CASCADE, related_name='chung_chi')
    id_mau = models.ForeignKey(MauChungChi, on_delete=models.SET_NULL, null=True, blank=True)
    ngay_cap = models.DateTimeField(auto_now_add=True)
    ngay_het_han = models.DateTimeField(blank=True, null=True)
    link_xac_thuc = models.CharField(max_length=500, blank=True, null=True)
    chuoi_hash_blockchain = models.CharField(max_length=255, blank=True, null=True)
    trang_thai = models.CharField(max_length=50, choices=TRANG_THAI_CHOICES, default='HieuLuc')

    def __str__(self):
        return self.ma_uuid_chung_chi

class NhatKyXacThuc(models.Model):
    id_nhat_ky = models.AutoField(primary_key=True)
    ma_uuid_chung_chi = models.ForeignKey(ChungChiSo, on_delete=models.CASCADE, related_name='nhat_ky_xac_thuc')
    nguoi_kiem_tra = models.CharField(max_length=255, blank=True, null=True)
    thoi_gian_xem = models.DateTimeField(auto_now_add=True)
    ly_do = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.ma_uuid_chung_chi} - {self.thoi_gian_xem}"
