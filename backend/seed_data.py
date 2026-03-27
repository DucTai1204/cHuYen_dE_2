import os
import django
import random
from datetime import timedelta
from django.utils import timezone
from uuid import uuid4

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import ToChuc, NguoiDung
from lms.models import (
    KyNang, KhoaHoc, Chuong, BaiGiang, KyNangKhoaHoc, 
    DangKyHoc, DanhGiaKhoaHoc, DanhGiaNhaTuyenDung, TuyenDung, TienDoBaiGiang
)
from certificates.models import MauChungChi, ChungChiSo

def run_seed():
    print("Xóa dữ liệu cũ để tạo mới hoàn toàn...")
    ChungChiSo.objects.all().delete()
    MauChungChi.objects.all().delete()
    TienDoBaiGiang.objects.all().delete()
    TuyenDung.objects.all().delete()
    DanhGiaNhaTuyenDung.objects.all().delete()
    DanhGiaKhoaHoc.objects.all().delete()
    DangKyHoc.objects.all().delete()
    KyNangKhoaHoc.objects.all().delete()
    BaiGiang.objects.all().delete()
    Chuong.objects.all().delete()
    KhoaHoc.objects.all().delete()
    KyNang.objects.all().delete()
    NguoiDung.objects.exclude(is_superuser=True).delete()
    ToChuc.objects.all().delete()

    print("--- 1. Seed Tổ Chức (FPT & VNPT) ---")
    tc_fpt = ToChuc.objects.create(ten_to_chuc="Tập đoàn FPT", ma_so_thue="0101248141", loai_hinh='DoanhNghiep', dia_chi="Tòa nhà FPT, Số 10 Phạm Văn Bạch, Hà Nội")
    tc_vnpt = ToChuc.objects.create(ten_to_chuc="Tập đoàn VNPT", ma_so_thue="0100684378", loai_hinh='DoanhNghiep', dia_chi="57 Huỳnh Thúc Kháng, Đống Đa, Hà Nội")

    print("--- 2. Seed Người Dùng (Password: 123456) ---")
    
    # 4 Giảng viên (giangvien_1 -> giangvien_4)
    gvs = [
        NguoiDung.objects.create_user(username='giangvien_1', email='gv1@fpt.com', password='123456', ho_va_ten="TS. Phạm Gia Khang", vai_tro='GiangVien', id_to_chuc=tc_fpt, ky_nang="Python, AI"),
        NguoiDung.objects.create_user(username='giangvien_2', email='gv2@vnpt.vn', password='123456', ho_va_ten="ThS. Nguyễn Hoài Linh", vai_tro='GiangVien', id_to_chuc=tc_vnpt, ky_nang="React, NodeJS"),
        NguoiDung.objects.create_user(username='giangvien_3', email='gv3@fpt.com', password='123456', ho_va_ten="TS. Lê Huy Thành", vai_tro='GiangVien', id_to_chuc=tc_fpt, ky_nang="Cyber Security"),
        NguoiDung.objects.create_user(username='giangvien_4', email='gv4@vnpt.vn', password='123456', ho_va_ten="Senior Hữu Hà", vai_tro='GiangVien', id_to_chuc=tc_vnpt, ky_nang="System Design, DevOps"),
    ]

    # HR Tuyển dụng duy trì 2 người
    ntds = [
        NguoiDung.objects.create_user(username='hr_fpt', email='hr@fpt.com.vn', password='123456', ho_va_ten="Phạm Nhật HR (FPT)", vai_tro='NhaTuyenDung', id_to_chuc=tc_fpt),
        NguoiDung.objects.create_user(username='hr_vnpt', email='hr@vnpt.vn', password='123456', ho_va_ten="Trần Tuyển Dụng (VNPT)", vai_tro='NhaTuyenDung', id_to_chuc=tc_vnpt),
    ]

    # 7 Học viên (hocvien_1 -> hocvien_7)
    hvs = []
    ho_lot = ["Nguyễn Văn", "Trần Thị", "Lê Đình", "Phạm Hoàng", "Võ Thị", "Đặng Minh", "Bùi Tấn"]
    ten = ["Anh", "Bình", "Chí", "Dung", "Em", "Phong", "Giang", "Hải", "Tuấn"]
    for i in range(1, 8):
        full_name = f"{random.choice(ho_lot)} {random.choice(ten)}"
        username = f"hocvien_{i}"
        hv = NguoiDung.objects.create_user(
            username=username, 
            email=f"{username}@gmail.com", 
            password='123456', 
            ho_va_ten=full_name, 
            vai_tro='HocVien', 
            ready_to_work=random.choice([True, False])
        )
        hvs.append(hv)

    print("--- 3. Seed Kỹ Năng ---")
    skill_names = ["Python", "JavaScript", "HTML/CSS", "ReactJS", "NodeJS", "Django", "NextJS", "Git/Github", "SQL/MySQL", "Java", "C++", "Docker/K8s", "AI/Machine Learning", "Flutter/Dart", "QA/Testing", "UI/UX", "Security", "TypeScript"]
    skill_objs = {}
    for i, sn in enumerate(skill_names):
        skill_objs[sn] = KyNang.objects.create(ten_ky_nang=sn, ma_tieu_chuan=f"SKILL-{i+100}", mo_ta=f"Kỹ năng lập trình hệ thống cho {sn}.")

    print("--- 4. Seed 18 Khóa Học ---")
    course_data = [
        {"name": "Lập trình Python Cơ bản đến Nâng cao", "cat": "Lập trình Backend", "price": 1200000, "level": "CoSo", "sk": ["Python"], "yt": "https://www.youtube.com/embed/rfscVS0vtbw", "thumb": "https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg"},
        {"name": "Xây dựng Web với ReactJS Thực Chiến 2024", "cat": "Lập trình Frontend", "price": 1500000, "level": "TrungCap", "sk": ["ReactJS", "JavaScript"], "yt": "https://www.youtube.com/embed/bMknfKXIFA8", "thumb": "https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg"},
        {"name": "Backend Node.js/Express Căn bản", "cat": "Lập trình Backend", "price": 1300000, "level": "CoSo", "sk": ["NodeJS", "JavaScript"], "yt": "https://www.youtube.com/embed/Oe421EPjeBE", "thumb": "https://img.youtube.com/vi/Oe421EPjeBE/maxresdefault.jpg"},
        {"name": "Khoá học JavaScript Toàn Tập", "cat": "Lập trình Web", "price": 800000, "level": "CoSo", "sk": ["JavaScript"], "yt": "https://www.youtube.com/embed/W6NZfCO5SIk", "thumb": "https://img.youtube.com/vi/W6NZfCO5SIk/maxresdefault.jpg"},
        {"name": "Thực Hành HTML & CSS Nền Tảng", "cat": "Lập trình Frontend", "price": 500000, "level": "CoSo", "sk": ["HTML/CSS"], "yt": "https://www.youtube.com/embed/mU6anWqZJcc", "thumb": "https://img.youtube.com/vi/mU6anWqZJcc/maxresdefault.jpg"},
        {"name": "Làm chủ Django Rest Framework Toàn Tập", "cat": "Lập trình Backend", "price": 1600000, "level": "NangCao", "sk": ["Python", "Django"], "yt": "https://www.youtube.com/embed/F5mRW0jo-U4", "thumb": "https://img.youtube.com/vi/F5mRW0jo-U4/maxresdefault.jpg"},
        {"name": "Phát triển Phầm Mềm với Next.js 14", "cat": "Lập trình Frontend", "price": 2000000, "level": "NangCao", "sk": ["NextJS", "ReactJS"], "yt": "https://www.youtube.com/embed/ZVnjOPwW4ZA", "thumb": "https://img.youtube.com/vi/ZVnjOPwW4ZA/maxresdefault.jpg"},
        {"name": "Quản lý mã nguồn dự án với Git & Github", "cat": "Công cụ", "price": 300000, "level": "CoSo", "sk": ["Git/Github"], "yt": "https://www.youtube.com/embed/8JJ101D3knE", "thumb": "https://img.youtube.com/vi/8JJ101D3knE/maxresdefault.jpg"},
        {"name": "Cơ sở dữ liệu RDBMS, SQL & MySQL", "cat": "Cơ sở dữ liệu", "price": 900000, "level": "CoSo", "sk": ["SQL/MySQL"], "yt": "https://www.youtube.com/embed/HXV3zeQKqGY", "thumb": "https://img.youtube.com/vi/HXV3zeQKqGY/maxresdefault.jpg"},
        {"name": "Kiến trúc Java Spring Boot Microservices", "cat": "Lập trình Backend", "price": 2500000, "level": "NangCao", "sk": ["Java"], "yt": "https://www.youtube.com/embed/9SGDpanrc8U", "thumb": "https://img.youtube.com/vi/9SGDpanrc8U/maxresdefault.jpg"},
        {"name": "Lập trình C++ cho người mới bắt đầu", "cat": "Lập trình Cơ bản", "price": 600000, "level": "CoSo", "sk": ["C++"], "yt": "https://www.youtube.com/embed/vLnPwxZdW4Y", "thumb": "https://img.youtube.com/vi/vLnPwxZdW4Y/maxresdefault.jpg"},
        {"name": "Khoá học CI/CD DevOps với Docker & Kubernetes", "cat": "DevOps", "price": 3000000, "level": "NangCao", "sk": ["Docker/K8s"], "yt": "https://www.youtube.com/embed/3c-iZaI2fPE", "thumb": "https://img.youtube.com/vi/3c-iZaI2fPE/maxresdefault.jpg"},
        {"name": "Trí tuệ nhân tạo Data Science & Machine Learning", "cat": "AI/Trí tuệ nhân tạo", "price": 2800000, "level": "TrungCap", "sk": ["Python", "AI/Machine Learning"], "yt": "https://www.youtube.com/embed/7eh4d6sabA0", "thumb": "https://img.youtube.com/vi/7eh4d6sabA0/maxresdefault.jpg"},
        {"name": "Xây dựng ứng dụng Di động Cross-platform Flutter", "cat": "Lập trình Mobile", "price": 1800000, "level": "TrungCap", "sk": ["Flutter/Dart"], "yt": "https://www.youtube.com/embed/VPvVD8t02U8", "thumb": "https://img.youtube.com/vi/VPvVD8t02U8/maxresdefault.jpg"},
        {"name": "Kiểm thử phần mềm Tự Động Automation QA Tester", "cat": "Kiểm thử phần mềm", "price": 1200000, "level": "CoSo", "sk": ["QA/Testing"], "yt": "https://www.youtube.com/embed/NOymI5525P4", "thumb": "https://img.youtube.com/vi/NOymI5525P4/maxresdefault.jpg"},
        {"name": "Thiết kế UI/UX Thực chiến với Figma", "cat": "Thiết kế UI/UX", "price": 800000, "level": "CoSo", "sk": ["UI/UX"], "yt": "https://www.youtube.com/embed/c9Wg6Cb_YlU", "thumb": "https://img.youtube.com/vi/c9Wg6Cb_YlU/maxresdefault.jpg"},
        {"name": "Bảo mật hệ thống thông tin (Cyber Security)", "cat": "Bảo mật", "price": 2500000, "level": "NangCao", "sk": ["Security"], "yt": "https://www.youtube.com/embed/bPVaOlJ6ln0", "thumb": "https://img.youtube.com/vi/bPVaOlJ6ln0/maxresdefault.jpg"},
        {"name": "Mastering TypeScript cho Web Backend", "cat": "Lập trình Frontend", "price": 1100000, "level": "TrungCap", "sk": ["TypeScript", "JavaScript"], "yt": "https://www.youtube.com/embed/BwuLxPH8IDs", "thumb": "https://img.youtube.com/vi/BwuLxPH8IDs/maxresdefault.jpg"}
    ]

    khoa_hoc_objs = []
    now = timezone.now()

    ch_names_master = ["Cài đặt & Khái niệm căn bản", "Cấu trúc & Cú pháp", "Thực hành ứng dụng cốt lõi", "Dự án Thực chiến", "Triển khai & Cấu hình"]

    for idx, c in enumerate(course_data):
        gv = gvs[idx % len(gvs)] # Phân đều 18 khóa cho 4 GV
        
        kh = KhoaHoc.objects.create(
            id_giang_vien=gv,
            ten_khoa_hoc=c['name'],
            mo_ta_ngan=f"Thành thạo {c['name']} chỉ sau thời gian ngắn học tập.",
            mo_ta_chi_tiet=f"Lộ trình {c['name']} dành cho bạn. Khóa học được thiết kế cực kỳ đa dạng bài giảng từ lý thuyết video, tài liệu chuyên sâu cho tới bài kiểm tra năng lực.",
            gia_goc=c['price'] * 1.5,
            gia_tien=c['price'],
            trinh_do=c['level'],
            danh_muc=c['cat'],
            cong_khai=True,
            is_sequential=random.choice([True, False]),
            hinh_anh_thumbnail=c['thumb']
        )
        khoa_hoc_objs.append(kh)

        # Gán kỹ năng
        for sk_name in c['sk']:
            KyNangKhoaHoc.objects.create(id_khoa_hoc=kh, id_ky_nang=skill_objs[sk_name], cap_do_dat_duoc="Tốt")

        MauChungChi.objects.create(
            id_khoa_hoc=kh,
            ten_mau=f"Certificate of {c['name']}",
            hinh_nen_url="https://images.unsplash.com/photo-1555523969-9f220317e0b5?w=1200&q=80"
        )

        # Tạo Chương (3-5 chương mỗi khóa học)
        so_chuong = random.randint(3, 5)
        for c_idx in range(so_chuong):
            chuong = Chuong.objects.create(
                id_khoa_hoc=kh, 
                ten_chuong=f"Chương {c_idx+1}: {ch_names_master[c_idx % len(ch_names_master)]}", 
                thu_tu=c_idx+1
            )
            
            # ĐA DẠNG BÀI GIẢNG (Video, Quiz, TaiLieu)
            so_bai_mong_muon = random.randint(2, 4)
            for b_idx in range(so_bai_mong_muon):
                loai_bai = random.choices(['Video', 'TaiLieu', 'Quiz'], weights=[60, 25, 15])[0]
                
                # Bài đầu tiên ưu tiên định dạng video để cho người dùng xem trước
                if c_idx == 0 and b_idx == 0:
                    loai_bai = 'Video'
                
                # URL mặc định cho File hoặc Video
                b_url = f"{c['yt']}?start={b_idx * 150}" if loai_bai == 'Video' else "https://example.com/document.pdf"

                BaiGiang.objects.create(
                    id_khoa_hoc=kh, id_chuong=chuong, 
                    ten_bai_giang=f"Bài {b_idx + 1}: Nội dung {loai_bai} {b_idx}", 
                    loai_bai=loai_bai, 
                    thoi_luong_phut=random.randint(5, 45) if loai_bai == 'Video' else random.randint(5, 10), 
                    thu_tu=b_idx + 1, 
                    noi_dung_url=b_url, 
                    la_xem_truoc=(c_idx==0 and b_idx==0)
                )

    print("--- 5. Seed Đăng Ký, Đánh Giá Khóa & Cấp CC ---")
    trang_thai_hoc = ['DangHoc', 'DaXong', 'Huy']
    for hv in hvs:
        courses_to_enroll = random.sample(khoa_hoc_objs, random.randint(4, 8))
        for kh in courses_to_enroll:
            status = random.choice(trang_thai_hoc)
            phan_tram = 100 if status == 'DaXong' else random.choice([10, 30, 50, 70, 85])
            
            dk = DangKyHoc.objects.create(
                id_nguoi_dung=hv, id_khoa_hoc=kh,
                trang_thai_hoc=status, phan_tram_hoan_thanh=phan_tram,
                ngay_dang_ky=now - timedelta(days=random.randint(10, 150))
            )

            all_lessons = BaiGiang.objects.filter(id_khoa_hoc=kh).order_by('id_chuong__thu_tu', 'thu_tu')
            lesson_count = all_lessons.count()
            
            if lesson_count > 0:
                completed_count = int(lesson_count * (phan_tram / 100))
                for idx, lesson in enumerate(all_lessons):
                    is_completed = (idx < completed_count)
                    TienDoBaiGiang.objects.create(
                        id_dang_ky=dk, id_bai_giang=lesson, da_hoan_thanh=is_completed,
                        ngay_hoan_thanh=(now - timedelta(days=random.randint(1, 9))) if is_completed else None
                    )

            if status == 'DaXong':
                mau = MauChungChi.objects.filter(id_khoa_hoc=kh).first()
                if mau:
                    ChungChiSo.objects.create(ma_uuid_chung_chi=f"CERT-{uuid4().hex[:8].upper()}-{kh.id_khoa_hoc}", id_dang_ky=dk, id_mau=mau, trang_thai='HieuLuc', chuoi_hash_blockchain=uuid4().hex)
                
                DanhGiaKhoaHoc.objects.update_or_create(
                    id_khoa_hoc=kh, id_nguoi_dung=hv,
                    defaults={
                        'so_sao': random.choices([3, 4, 5], weights=[10, 30, 60])[0], 
                        'nhan_xet': random.choice([
                            f"Kiến thức {kh.ten_khoa_hoc} rất thực tế, giảng viên giảng rất dễ hiểu.",
                            "Tài liệu phong phú, bài tập thực hành giúp tôi hiểu sâu hơn.",
                            "Khóa học tuyệt vời, tôi đã áp dụng được ngay vào công việc.",
                            "Rất đáng đồng tiền bát gạo, lộ trình học rõ ràng."
                        ])
                    }
                )

    print("--- 6. Seed Đánh Giá NTD & Tuyển Dụng ---")
    phien_dich_ntd = [
        "Ứng viên có tư duy tốt, kỹ năng thực hành từ khóa học này rất sát với dự án thực tế.",
        "Chúng tôi đánh giá cao trình độ chuyên môn của các học viên tốt nghiệp khóa này.",
        "Kiến thức đầu ra đúng tiêu chuẩn ngành, team HR rất hài lòng.",
        "Chất lượng đào tạo ổn định, giúp giảm thời gian đào tạo nội bộ cho nhân viên mới."
    ]
    for ntd in ntds:
        reviewed_course = random.sample(khoa_hoc_objs, random.randint(5, 8))
        for r_kh in reviewed_course:
            DanhGiaNhaTuyenDung.objects.create(
                id_khoa_hoc=r_kh, id_nha_tuyen_dung=ntd, 
                so_sao_phu_hop=random.choices([4, 5], weights=[20, 80])[0], 
                nhan_xet_chuyen_mon=random.choice(phien_dich_ntd)
            )
            
            hoc_vien_da_xong = NguoiDung.objects.filter(dang_ky_hoc__id_khoa_hoc=r_kh, dang_ky_hoc__trang_thai_hoc='DaXong')
            for hv in hoc_vien_da_xong:
                if random.random() < 0.4:
                    TuyenDung.objects.update_or_create(
                        id_nha_tuyen_dung=ntd, id_hoc_vien=hv, id_khoa_hoc=r_kh,
                        defaults={
                            'trang_thai': random.choice(['ChoXacNhan', 'DaDongY', 'TuChoi']),
                            'ghi_chu': "Team phát triển sản phẩm của chúng tôi đang cần vị trí này, mời bạn tham gia phỏng vấn."
                        }
                    )

    print("\n" + "="*50)
    print(" CẬP NHẬT SEED DATA THÀNH CÔNG")
    print("="*50)
    print(f"Tổng Số Khóa học: {len(khoa_hoc_objs)}")
    print(f"Tổng Số Giảng viên: {len(gvs)} (giangvien_1 đến giangvien_4)")
    print(f"Tổng Số Học viên: {len(hvs)} (hocvien_1 đến hocvien_7)")
    print(f"Tổng Số Nhà Tuyển Dụng: {len(ntds)} (hr_fpt, hr_vnpt)")
    print("Mọi password đăng nhập đều là: 123456")

if __name__ == '__main__':
    run_seed()
