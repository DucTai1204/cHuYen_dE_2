from django.db import models
from core.models import NguoiDung

class KyNang(models.Model):
    id_ky_nang = models.AutoField(primary_key=True)
    ten_ky_nang = models.CharField(max_length=255)
    ma_tieu_chuan = models.CharField(max_length=100, blank=True, null=True)
    mo_ta = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.ten_ky_nang

class KhoaHoc(models.Model):
    TRINH_DO_CHOICES = [
        ('CoSo', 'Cơ sở'),
        ('TrungCap', 'Trung cấp'),
        ('NangCao', 'Nâng cao'),
    ]

    id_khoa_hoc = models.AutoField(primary_key=True)
    id_giang_vien = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='khoa_hoc_giang_day')
    ten_khoa_hoc = models.CharField(max_length=255)
    mo_ta_ngan = models.CharField(max_length=500, blank=True, null=True)
    mo_ta_chi_tiet = models.TextField(blank=True, null=True)
    gia_tien = models.FloatField(default=0.0)
    gia_goc = models.FloatField(default=0.0)  # Giá gốc để tính giảm giá
    hinh_anh_thumbnail = models.CharField(max_length=500, blank=True, null=True)
    trinh_do = models.CharField(max_length=50, choices=TRINH_DO_CHOICES, default='CoSo')
    danh_muc = models.CharField(max_length=100, blank=True, null=True)
    cong_khai = models.BooleanField(default=False)
    is_sequential = models.BooleanField(default=False, help_text='Bật chế độ học tuần tự: phải hoàn thành bài trước mới mở được bài sau')
    ngay_tao = models.DateTimeField(auto_now_add=True)
    ngay_cap_nhat = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.ten_khoa_hoc

    @property
    def tong_hoc_vien(self):
        return self.dang_ky_hoc.count()

    @property
    def tong_chuong(self):
        return self.chuong_set.count()

    @property
    def tong_bai(self):
        return BaiGiang.objects.filter(id_chuong__id_khoa_hoc=self).count()


class Chuong(models.Model):
    id_chuong = models.AutoField(primary_key=True)
    id_khoa_hoc = models.ForeignKey(KhoaHoc, on_delete=models.CASCADE, related_name='chuong_set')
    ten_chuong = models.CharField(max_length=255)
    mo_ta = models.TextField(blank=True, null=True)
    thu_tu = models.IntegerField(default=1)

    class Meta:
        ordering = ['thu_tu']

    def __str__(self):
        return f"{self.id_khoa_hoc.ten_khoa_hoc} - Chương {self.thu_tu}: {self.ten_chuong}"


class BaiGiang(models.Model):
    LOAI_BAI_CHOICES = [
        ('Video', 'Video bài giảng'),
        ('Quiz', 'Bài kiểm tra'),
        ('TaiLieu', 'Tài liệu'),
        ('VanBan', 'Văn bản'),
    ]

    id_bai_giang = models.AutoField(primary_key=True)
    id_khoa_hoc = models.ForeignKey(KhoaHoc, on_delete=models.CASCADE, related_name='bai_giang')
    id_chuong = models.ForeignKey(Chuong, on_delete=models.CASCADE, related_name='bai_giang', null=True, blank=True)
    ten_bai_giang = models.CharField(max_length=255)
    noi_dung_url = models.TextField(blank=True, null=True)
    loai_bai = models.CharField(max_length=50, choices=LOAI_BAI_CHOICES, default='Video')
    thoi_luong_phut = models.IntegerField(default=0)
    thu_tu = models.IntegerField(default=1)
    la_xem_truoc = models.BooleanField(default=False)
    video_watch_percentage = models.IntegerField(
        default=100,
        help_text='Với bài Video: % thời lượng cần xem để hoàn thành (33, 66, 100). Không dùng cho loại bài khác.'
    )

    class Meta:
        ordering = ['thu_tu']

    def __str__(self):
        return self.ten_bai_giang


class KyNangKhoaHoc(models.Model):
    id_khoa_hoc = models.ForeignKey(KhoaHoc, on_delete=models.CASCADE)
    id_ky_nang = models.ForeignKey(KyNang, on_delete=models.CASCADE)
    cap_do_dat_duoc = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('id_khoa_hoc', 'id_ky_nang')

    def __str__(self):
        return f"{self.id_khoa_hoc.ten_khoa_hoc} - {self.id_ky_nang.ten_ky_nang}"


class DangKyHoc(models.Model):
    TRANG_THAI_CHOICES = [
        ('DangHoc', 'Đang học'),
        ('DaXong', 'Đã xong'),
        ('Huy', 'Hủy')
    ]

    id_dang_ky = models.AutoField(primary_key=True)
    id_nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='dang_ky_hoc')
    id_khoa_hoc = models.ForeignKey(KhoaHoc, on_delete=models.CASCADE, related_name='dang_ky_hoc')
    ngay_dang_ky = models.DateTimeField(auto_now_add=True)
    phan_tram_hoan_thanh = models.FloatField(default=0.0)
    trang_thai_hoc = models.CharField(max_length=50, choices=TRANG_THAI_CHOICES, default='DangHoc')

    def __str__(self):
        return f"{self.id_nguoi_dung.username} - {self.id_khoa_hoc.ten_khoa_hoc}"


class TienDoBaiGiang(models.Model):
    """Theo dõi trạng thái hoàn thành từng bài giảng của người học."""
    id_dang_ky = models.ForeignKey(
        DangKyHoc, on_delete=models.CASCADE, related_name='tien_do_bai'
    )
    id_bai_giang = models.ForeignKey(
        BaiGiang, on_delete=models.CASCADE, related_name='tien_do'
    )
    da_hoan_thanh = models.BooleanField(default=False)
    ngay_hoan_thanh = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('id_dang_ky', 'id_bai_giang')

    def __str__(self):
        return (
            f"{self.id_dang_ky.id_nguoi_dung.username} - "
            f"{self.id_bai_giang.ten_bai_giang} - "
            f"{'Hoàn thành' if self.da_hoan_thanh else 'Chưa xong'}"
        )
