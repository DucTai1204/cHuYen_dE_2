from django.db import models
from django.db.models import Avg
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
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
    gia_goc = models.FloatField(default=0.0)
    hinh_anh_thumbnail = models.CharField(max_length=500, blank=True, null=True)
    trinh_do = models.CharField(max_length=50, choices=TRINH_DO_CHOICES, default='CoSo')
    danh_muc = models.CharField(max_length=100, blank=True, null=True)
    cong_khai = models.BooleanField(default=False)
    is_sequential = models.BooleanField(default=False, help_text='Bật chế độ học tuần tự')
    
    # --- CÁC TRƯỜNG THỐNG KÊ MỚI ---
    so_nguoi_dang_hoc = models.PositiveIntegerField(default=0)
    so_nguoi_da_hoan_thanh = models.PositiveIntegerField(default=0)
    trung_binh_sao = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    tong_so_danh_gia = models.PositiveIntegerField(default=0)
    
    # --- THỐNG KÊ TỪ NHÀ TUYỂN DỤNG ---
    trung_binh_sao_ntd = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    tong_so_danh_gia_ntd = models.PositiveIntegerField(default=0)
    so_nguoi_co_viec_lam = models.PositiveIntegerField(default=0)
    
    ngay_tao = models.DateTimeField(auto_now_add=True)
    ngay_cap_nhat = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.ten_khoa_hoc

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
    video_watch_percentage = models.IntegerField(default=100)

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


# --- BẢNG ĐÁNH GIÁ MỚI ---
class DanhGiaKhoaHoc(models.Model):
    id_danh_gia = models.AutoField(primary_key=True)
    id_khoa_hoc = models.ForeignKey(KhoaHoc, on_delete=models.CASCADE, related_name='danh_gia')
    id_nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE)
    so_sao = models.IntegerField(choices=[(i, f"{i} sao") for i in range(1, 6)], default=5)
    nhan_xet = models.TextField(blank=True, null=True)
    ngay_tao = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('id_khoa_hoc', 'id_nguoi_dung') # Mỗi người chỉ đánh giá 1 lần/khóa

    def __str__(self):
        return f"{self.id_nguoi_dung.username} - {self.id_khoa_hoc.ten_khoa_hoc} ({self.so_sao} sao)"


class DanhGiaNhaTuyenDung(models.Model):
    id_danh_gia = models.AutoField(primary_key=True)
    id_khoa_hoc = models.ForeignKey(KhoaHoc, on_delete=models.CASCADE, related_name='danh_gia_ntd')
    id_nha_tuyen_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE)
    so_sao_phu_hop = models.IntegerField(choices=[(i, f"{i} sao") for i in range(1, 6)], default=5)
    nhan_xet_chuyen_mon = models.TextField(blank=True, null=True)
    ngay_tao = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('id_khoa_hoc', 'id_nha_tuyen_dung')

    def __str__(self):
        return f"NTD {self.id_nha_tuyen_dung.username} đánh giá {self.id_khoa_hoc.ten_khoa_hoc}"


class TinNhan(models.Model):
    id_tin_nhan = models.AutoField(primary_key=True)
    id_nguoi_gui = models.ForeignKey(
        'core.NguoiDung', on_delete=models.CASCADE, related_name='tin_nhan_da_gui'
    )
    id_nguoi_nhan = models.ForeignKey(
        'core.NguoiDung', on_delete=models.CASCADE, related_name='tin_nhan_da_nhan'
    )
    noi_dung = models.TextField()
    ngay_gui = models.DateTimeField(auto_now_add=True)
    is_recalled = models.BooleanField(default=False)
    da_xem = models.BooleanField(default=False)  # Người nhận đã xem chưa

    class Meta:
        ordering = ['-ngay_gui']

    def __str__(self):
        return f"Từ {self.id_nguoi_gui.username} đến {self.id_nguoi_nhan.username}"


class TuyenDung(models.Model):
    id_tuyen_dung = models.AutoField(primary_key=True)
    id_nha_tuyen_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='danh_sach_da_tuyen')
    id_hoc_vien = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='duoc_tuyen_dung')
    id_khoa_hoc = models.ForeignKey(KhoaHoc, on_delete=models.CASCADE)
    TRANG_THAI_TUYEN = [
        ('ChoXacNhan', 'Chờ xác nhận'),
        ('DaDongY', 'Đã đồng ý'),
        ('TuChoi', 'Từ chối'),
    ]
    trang_thai = models.CharField(max_length=20, choices=TRANG_THAI_TUYEN, default='ChoXacNhan')
    ngay_tuyen = models.DateTimeField(auto_now_add=True)
    ghi_chu = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('id_nha_tuyen_dung', 'id_hoc_vien', 'id_khoa_hoc')

    def __str__(self):
        return f"NTD {self.id_nha_tuyen_dung.username} tuyển {self.id_hoc_vien.username} (Khóa {self.id_khoa_hoc.ten_khoa_hoc})"


class TienDoBaiGiang(models.Model):
    id_dang_ky = models.ForeignKey(DangKyHoc, on_delete=models.CASCADE, related_name='tien_do_bai')
    id_bai_giang = models.ForeignKey(BaiGiang, on_delete=models.CASCADE, related_name='tien_do')
    da_hoan_thanh = models.BooleanField(default=False)
    ngay_hoan_thanh = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('id_dang_ky', 'id_bai_giang')


class CauHoi(models.Model):
    id_cau_hoi = models.AutoField(primary_key=True)
    id_bai_giang = models.ForeignKey(BaiGiang, on_delete=models.CASCADE, related_name='cau_hoi_set')
    noi_dung = models.TextField()
    diem = models.FloatField(default=1.0)
    thu_tu = models.IntegerField(default=1)

    class Meta:
        ordering = ['thu_tu']

    def __str__(self):
        return f"Câu hỏi {self.thu_tu} - {self.id_bai_giang.ten_bai_giang}"


class LuaChon(models.Model):
    id_lua_chon = models.AutoField(primary_key=True)
    id_cau_hoi = models.ForeignKey(CauHoi, on_delete=models.CASCADE, related_name='lua_chon_set')
    noi_dung = models.TextField()
    la_dap_an_dung = models.BooleanField(default=False)

    def __str__(self):
        return f"Lựa chọn cho {self.id_cau_hoi.id_cau_hoi}"


class KetQuaQuiz(models.Model):
    id_ket_qua = models.AutoField(primary_key=True)
    id_dang_ky = models.ForeignKey(DangKyHoc, on_delete=models.CASCADE, related_name='ket_qua_quiz')
    id_bai_giang = models.ForeignKey(BaiGiang, on_delete=models.CASCADE)
    diem_so = models.FloatField()
    tong_diem = models.FloatField()
    da_dat = models.BooleanField(default=False)
    ngay_lam = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id_dang_ky.id_nguoi_dung.username} - {self.id_bai_giang.ten_bai_giang}: {self.diem_so}/{self.tong_diem}"


# ==============================================================================
# LOGIC TỰ ĐỘNG CẬP NHẬT THỐNG KÊ (DJANGO SIGNALS)
# ==============================================================================

# 1. Cập nhật số người học & số người hoàn thành khi có đăng ký mới hoặc thay đổi trạng thái
@receiver(post_save, sender=DangKyHoc)
@receiver(post_delete, sender=DangKyHoc)
def update_course_stats_enrollment(sender, instance, **kwargs):
    course = instance.id_khoa_hoc
    course.so_nguoi_dang_hoc = DangKyHoc.objects.filter(id_khoa_hoc=course).count()
    course.so_nguoi_da_hoan_thanh = DangKyHoc.objects.filter(id_khoa_hoc=course, trang_thai_hoc='DaXong').count()
    course.save()

# 2. Cập nhật số sao trung bình và tổng số lượt đánh giá
@receiver(post_save, sender=DanhGiaKhoaHoc)
@receiver(post_delete, sender=DanhGiaKhoaHoc)
def update_course_stats_rating(sender, instance, **kwargs):
    course = instance.id_khoa_hoc
    ratings = DanhGiaKhoaHoc.objects.filter(id_khoa_hoc=course)
    
    count = ratings.count()
    if count > 0:
        avg_rating = ratings.aggregate(Avg('so_sao'))['so_sao__avg']
    else:
        avg_rating = 0.00

    course.tong_so_danh_gia = count
    course.trung_binh_sao = avg_rating
    course.save()


@receiver(post_save, sender=DanhGiaNhaTuyenDung)
@receiver(post_delete, sender=DanhGiaNhaTuyenDung)
def update_course_ntd_stats(sender, instance, **kwargs):
    course = instance.id_khoa_hoc
    ratings = DanhGiaNhaTuyenDung.objects.filter(id_khoa_hoc=course)
    
    count = ratings.count()
    if count > 0:
        avg_rating = ratings.aggregate(Avg('so_sao_phu_hop'))['so_sao_phu_hop__avg']
    else:
        avg_rating = 0.00

    course.tong_so_danh_gia_ntd = count
    course.trung_binh_sao_ntd = avg_rating
    course.save()


@receiver(post_save, sender=TuyenDung)
@receiver(post_delete, sender=TuyenDung)
def update_course_employment_stats(sender, instance, **kwargs):
    course = instance.id_khoa_hoc
    # Chỉ đếm những học viên đã nhấn nút ĐỒNG Ý
    count = TuyenDung.objects.filter(id_khoa_hoc=instance.id_khoa_hoc, trang_thai='DaDongY').values('id_hoc_vien').distinct().count()
    instance.id_khoa_hoc.so_nguoi_co_viec_lam = count
    instance.id_khoa_hoc.save()
