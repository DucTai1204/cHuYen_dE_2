from django.db import models
from django.contrib.auth.models import AbstractUser

class ToChuc(models.Model):
    LOAI_HINH_CHOICES = [
        ('DaiHoc', 'Đại học'),
        ('DoanhNghiep', 'Doanh nghiệp')
    ]

    id_to_chuc = models.AutoField(primary_key=True)
    ten_to_chuc = models.CharField(max_length=255)
    ma_so_thue = models.CharField(max_length=50, blank=True, null=True)
    loai_hinh = models.CharField(max_length=50, choices=LOAI_HINH_CHOICES)
    dia_chi = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.ten_to_chuc

class NguoiDung(AbstractUser):
    VAI_TRO_CHOICES = [
        ('HocVien', 'Học viên'),
        ('GiangVien', 'Giảng viên'),
        ('QuanTri', 'Quản trị viên'),
        ('NguoiXacThuc', 'Người xác thực')
    ]

    id_nguoi_dung = models.AutoField(primary_key=True)
    id_to_chuc = models.ForeignKey(
        ToChuc, on_delete=models.SET_NULL, null=True, blank=True, related_name='nguoi_dung'
    )
    ho_va_ten = models.CharField(max_length=255)
    vai_tro = models.CharField(max_length=50, choices=VAI_TRO_CHOICES, default='HocVien')
    trang_thai = models.BooleanField(default=True)

    # Đã có email trong AbstractUser, ta có thể dùng nó luôn.
    
    def __str__(self):
        return f"{self.username} - {self.vai_tro}"
