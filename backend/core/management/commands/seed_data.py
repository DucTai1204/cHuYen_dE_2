from django.core.management.base import BaseCommand
from core.models import NguoiDung, ToChuc
from lms.models import KhoaHoc, BaiGiang, KyNang, KyNangKhoaHoc
from certificates.models import MauChungChi
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Tạo dữ liệu mẫu cho hệ thống e-learning'

    def handle(self, *args, **kwargs):
        self.stdout.write('Đang dọn dẹp dữ liệu cũ...')
        NguoiDung.objects.exclude(is_superuser=True).delete()
        ToChuc.objects.all().delete()
        KhoaHoc.objects.all().delete()
        KyNang.objects.all().delete()

        self.stdout.write('Đang tạo Tổ chức...')
        to_chuc_1 = ToChuc.objects.create(ten_to_chuc='Đại học Công Nghệ', loai_hinh='DaiHoc')
        to_chuc_2 = ToChuc.objects.create(ten_to_chuc='Công ty FPT', loai_hinh='DoanhNghiep')

        self.stdout.write('Đang tạo Quản trị viên, Giảng viên, Người xác thực...')
        admin = NguoiDung.objects.create(username='admin_org', email='admin@org.com', password=make_password('123456'), ho_va_ten='Quản trị hệ thống', vai_tro='QuanTri', is_staff=True)
        giang_vien = NguoiDung.objects.create(username='giangvien1', email='gv1@org.com', password=make_password('123456'), ho_va_ten='Nguyễn Văn Giảng Viên', vai_tro='GiangVien', id_to_chuc=to_chuc_1)
        doanh_nghiep = NguoiDung.objects.create(username='doanhnghiep1', email='dn1@org.com', password=make_password('123456'), ho_va_ten='Trần HR', vai_tro='NguoiXacThuc', id_to_chuc=to_chuc_2)

        self.stdout.write('Đang tạo Kỹ năng...')
        kn_python = KyNang.objects.create(ten_ky_nang='Python Cơ bản', ma_tieu_chuan='PY-101')
        kn_react = KyNang.objects.create(ten_ky_nang='ReactJS Nâng cao', ma_tieu_chuan='RC-202')
        kn_ai = KyNang.objects.create(ten_ky_nang='AI & Machine Learning', ma_tieu_chuan='AI-303')

        self.stdout.write('Đang tạo Khóa học và Bài giảng...')
        course_1 = KhoaHoc.objects.create(id_giang_vien=giang_vien, ten_khoa_hoc='ReactJS Masterclass 2026', gia_tien=500000, cong_khai=True)
        course_2 = KhoaHoc.objects.create(id_giang_vien=giang_vien, ten_khoa_hoc='Thiết kế hệ thống với Python', gia_tien=800000, cong_khai=True)

        KyNangKhoaHoc.objects.create(id_khoa_hoc=course_1, id_ky_nang=kn_react, cap_do_dat_duoc='Chuyên gia')
        KyNangKhoaHoc.objects.create(id_khoa_hoc=course_2, id_ky_nang=kn_python, cap_do_dat_duoc='Trung cấp')
        KyNangKhoaHoc.objects.create(id_khoa_hoc=course_2, id_ky_nang=kn_ai, cap_do_dat_duoc='Sơ cấp')

        BaiGiang.objects.create(id_khoa_hoc=course_1, ten_bai_giang='Giới thiệu ReactJS', thu_tu=1)
        BaiGiang.objects.create(id_khoa_hoc=course_1, ten_bai_giang='State và Props', thu_tu=2)
        BaiGiang.objects.create(id_khoa_hoc=course_2, ten_bai_giang='Mô hình Modular Monolith', thu_tu=1)

        self.stdout.write('Đang tạo Mẫu chứng chỉ...')
        MauChungChi.objects.create(id_khoa_hoc=course_1, ten_mau='Chứng chỉ ReactJS Chuyên nghiệp')
        MauChungChi.objects.create(id_khoa_hoc=course_2, ten_mau='Chứng chỉ Python Backend')

        self.stdout.write(self.style.SUCCESS('Thành công! Đã chèn dữ liệu mẫu vào cơ sở dữ liệu.'))
