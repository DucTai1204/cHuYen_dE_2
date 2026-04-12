from rest_framework import serializers
from .models import (
    KhoaHoc, Chuong, BaiGiang, DangKyHoc,
    TienDoBaiGiang, DanhGiaKhoaHoc, TinNhan,
    KyNang, KyNangKhoaHoc, DanhGiaNhaTuyenDung,
    TuyenDung, CauHoi, LuaChon, KetQuaQuiz
)
from certificates.serializers import ChungChiSoSerializer



class KyNangSerializer(serializers.ModelSerializer):
    class Meta:
        model = KyNang
        fields = '__all__'


class LuaChonSerializer(serializers.ModelSerializer):
    class Meta:
        model = LuaChon
        fields = ['id_lua_chon', 'id_cau_hoi', 'noi_dung', 'la_dap_an_dung']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        # Ẩn đáp án đúng nếu là học viên đang học
        if request and getattr(request.user, 'vai_tro', '') == 'HocVien':
             data.pop('la_dap_an_dung', None)
        return data


class CauHoiSerializer(serializers.ModelSerializer):
    lua_chon = LuaChonSerializer(source='lua_chon_set', many=True, read_only=True)

    class Meta:
        model = CauHoi
        fields = ['id_cau_hoi', 'id_bai_giang', 'noi_dung', 'diem', 'thu_tu', 'lua_chon']


class BaiGiangSerializer(serializers.ModelSerializer):
    """Serializer cho bài giảng — có thêm trường is_locked (chỉ đọc, tính từ context)."""
    is_locked = serializers.SerializerMethodField()
    cau_hoi = CauHoiSerializer(source='cau_hoi_set', many=True, read_only=True)

    class Meta:
        model = BaiGiang
        fields = [
            'id_bai_giang', 'id_khoa_hoc', 'id_chuong',
            'ten_bai_giang', 'noi_dung_url', 'loai_bai',
            'thoi_luong_phut', 'thu_tu', 'la_xem_truoc',
            'video_watch_percentage', 'is_locked', 'cau_hoi'
        ]

    def get_is_locked(self, obj):
        """
        Tính xem bài này có bị khóa không.
        context['completed_ids'] : set(id bài đã hoàn thành)
        context['is_sequential'] : bool — có bật chế độ tuần tự không
        context['sorted_lessons'] : danh sách BaiGiang đã sắp xếp
        Nếu không có context (VD: Seller xem) → không khóa bài nào.
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if getattr(request.user, 'vai_tro', '') == 'GiangVien':
            return False

        is_sequential = self.context.get('is_sequential', False)
        if not is_sequential:
            return False

        completed_ids = self.context.get('completed_ids', set())
        sorted_lessons = self.context.get('sorted_lessons', [])

        # Bài đầu tiên luôn mở
        if not sorted_lessons:
            return False
        first_id = sorted_lessons[0].id_bai_giang if hasattr(sorted_lessons[0], 'id_bai_giang') else sorted_lessons[0]
        if obj.id_bai_giang == first_id:
            return False

        # Tìm bài trước liền kề
        ids_list = [
            (l.id_bai_giang if hasattr(l, 'id_bai_giang') else l)
            for l in sorted_lessons
        ]
        try:
            idx = ids_list.index(obj.id_bai_giang)
        except ValueError:
            return False

        if idx == 0:
            return False
        prev_id = ids_list[idx - 1]
        return prev_id not in completed_ids


class ChuongSerializer(serializers.ModelSerializer):
    bai_giang = serializers.SerializerMethodField()

    class Meta:
        model = Chuong
        fields = '__all__'

    def get_bai_giang(self, obj):
        lessons = obj.bai_giang.all().order_by('thu_tu')
        return BaiGiangSerializer(lessons, many=True, context=self.context).data


class KyNangKhoaHocSerializer(serializers.ModelSerializer):
    ky_nang = KyNangSerializer(source='id_ky_nang', read_only=True)

    class Meta:
        model = KyNangKhoaHoc
        fields = '__all__'


class KhoaHocSerializer(serializers.ModelSerializer):
    """Serializer đầy đủ dành cho Seller (owner) — trả về nested chapters và lessons"""
    chuong_set = ChuongSerializer(many=True, read_only=True)
    bai_giang = BaiGiangSerializer(many=True, read_only=True)
    ky_nang = KyNangKhoaHocSerializer(source='kynangkhoahoc_set', many=True, read_only=True)
    
    # Giữ lại key cũ cho FE
    tong_hoc_vien = serializers.IntegerField(source='so_nguoi_dang_hoc', read_only=True)
    tong_chuong = serializers.ReadOnlyField()
    tong_bai = serializers.ReadOnlyField()
    ten_giang_vien = serializers.CharField(source='id_giang_vien.username', read_only=True)
    rating_details = serializers.SerializerMethodField()
    employer_endorsements = serializers.SerializerMethodField()

    class Meta:
        model = KhoaHoc
        fields = [
            'id_khoa_hoc', 'id_giang_vien', 'ten_khoa_hoc', 'mo_ta_ngan',
            'mo_ta_chi_tiet', 'gia_tien', 'gia_goc', 'hinh_anh_thumbnail',
            'url_video_preview',
            'trinh_do', 'danh_muc', 'cong_khai', 'is_sequential',
            'trung_binh_sao', 'tong_so_danh_gia', 'tong_hoc_vien', 'rating_details',
            'trung_binh_sao_ntd', 'tong_so_danh_gia_ntd', 'so_nguoi_co_viec_lam',
            'employer_endorsements',
            'chuong_set', 'bai_giang', 'ky_nang',
            'tong_chuong', 'tong_bai', 'ten_giang_vien',
            'ngay_tao', 'ngay_cap_nhat'
        ]
        read_only_fields = ['id_giang_vien', 'ngay_tao', 'ngay_cap_nhat']

    def get_rating_details(self, obj):
        from django.db.models import Count
        ratings = obj.danh_gia.values('so_sao').annotate(count=Count('so_sao'))
        dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in ratings:
            dist[r['so_sao']] = r['count']
        return dist

    def get_employer_endorsements(self, obj):
        # Lấy danh sách các NTD đã đánh giá
        ratings = obj.danh_gia_ntd.select_related('id_nha_tuyen_dung').all()
        return [
            {
                "ten_nha_tuyen_dung": r.id_nha_tuyen_dung.ho_va_ten or r.id_nha_tuyen_dung.username,
                "hinh_anh_logo": r.id_nha_tuyen_dung.hinh_anh_logo
            }
            for r in ratings
        ]


class KhoaHocListSerializer(serializers.ModelSerializer):
    """Serializer gọn cho danh sách marketplace (không nested bài giảng chi tiết)"""
    tong_hoc_vien = serializers.IntegerField(source='so_nguoi_dang_hoc', read_only=True)
    tong_chuong = serializers.ReadOnlyField()
    tong_bai = serializers.ReadOnlyField()
    ten_giang_vien = serializers.CharField(source='id_giang_vien.username', read_only=True)
    rating_details = serializers.SerializerMethodField()
    employer_endorsements = serializers.SerializerMethodField()

    class Meta:
        model = KhoaHoc
        fields = [
            'id_khoa_hoc', 'ten_khoa_hoc', 'mo_ta_ngan', 'gia_tien', 'gia_goc',
            'hinh_anh_thumbnail', 'url_video_preview', 'trinh_do', 'danh_muc', 'cong_khai',
            'ngay_tao', 'ngay_cap_nhat', 'tong_chuong', 'tong_bai',
            'ten_giang_vien', 'is_sequential',
            'so_nguoi_dang_hoc', 'so_nguoi_da_hoan_thanh', 
            'trung_binh_sao', 'tong_so_danh_gia', 'tong_hoc_vien', 'rating_details',
            'trung_binh_sao_ntd', 'tong_so_danh_gia_ntd', 'so_nguoi_co_viec_lam',
            'employer_endorsements',
        ]

    def get_rating_details(self, obj):
        from django.db.models import Count
        ratings = obj.danh_gia.values('so_sao').annotate(count=Count('so_sao'))
        dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in ratings:
            dist[r['so_sao']] = r['count']
        return dist

    def get_employer_endorsements(self, obj):
        ratings = obj.danh_gia_ntd.select_related('id_nha_tuyen_dung').all()
        return [
            {
                "ten_nha_tuyen_dung": r.id_nha_tuyen_dung.ho_va_ten or r.id_nha_tuyen_dung.username,
                "hinh_anh_logo": r.id_nha_tuyen_dung.hinh_anh_logo
            }
            for r in ratings
        ]


class DangKyHocSerializer(serializers.ModelSerializer):
    khoa_hoc = KhoaHocListSerializer(source='id_khoa_hoc', read_only=True)
    chung_chi = ChungChiSoSerializer(many=True, read_only=True)
    ho_va_ten = serializers.CharField(source='id_nguoi_dung.ho_va_ten', read_only=True)
    ten_hoc_vien = serializers.CharField(source='id_nguoi_dung.username', read_only=True)
    hinh_anh_hoc_vien = serializers.CharField(source='id_nguoi_dung.hinh_anh_logo', read_only=True)

    class Meta:
        model = DangKyHoc
        fields = '__all__'
        read_only_fields = ['id_nguoi_dung', 'ngay_dang_ky', 'trang_thai_hoc', 'phan_tram_hoan_thanh']


class TienDoBaiGiangSerializer(serializers.ModelSerializer):
    class Meta:
        model = TienDoBaiGiang
        fields = ['id', 'id_dang_ky', 'id_bai_giang', 'da_hoan_thanh', 'ngay_hoan_thanh']
        read_only_fields = ['id', 'ngay_hoan_thanh']


class DanhGiaKhoaHocSerializer(serializers.ModelSerializer):
    ten_nguoi_dung = serializers.CharField(source='id_nguoi_dung.username', read_only=True)

    class Meta:
        model = DanhGiaKhoaHoc
        fields = ['id_danh_gia', 'id_khoa_hoc', 'id_nguoi_dung', 'ten_nguoi_dung', 'so_sao', 'nhan_xet', 'ngay_tao']
        read_only_fields = ['id_nguoi_dung', 'ngay_tao']


class TinNhanSerializer(serializers.ModelSerializer):
    ten_nguoi_gui = serializers.CharField(source='id_nguoi_gui.username', read_only=True)
    ten_nguoi_nhan = serializers.CharField(source='id_nguoi_nhan.username', read_only=True)

    class Meta:
        model = TinNhan
        fields = ['id_tin_nhan', 'id_nguoi_gui', 'ten_nguoi_gui', 'id_nguoi_nhan', 'ten_nguoi_nhan', 'noi_dung', 'ngay_gui', 'is_recalled', 'da_xem']
        read_only_fields = ['id_nguoi_gui', 'ngay_gui', 'da_xem']


class DanhGiaNhaTuyenDungSerializer(serializers.ModelSerializer):
    ten_nha_tuyen_dung = serializers.CharField(source='id_nha_tuyen_dung.ho_va_ten', read_only=True)
    ten_dang_nhap = serializers.CharField(source='id_nha_tuyen_dung.username', read_only=True)
    hinh_anh_logo = serializers.CharField(source='id_nha_tuyen_dung.hinh_anh_logo', read_only=True)

    class Meta:
        model = DanhGiaNhaTuyenDung
        fields = [
            'id_danh_gia', 'id_khoa_hoc', 'id_nha_tuyen_dung', 
            'ten_nha_tuyen_dung', 'ten_dang_nhap', 'hinh_anh_logo', 
            'so_sao_phu_hop', 'nhan_xet_chuyen_mon', 'ngay_tao'
        ]
        read_only_fields = ['id_nha_tuyen_dung', 'ngay_tao']


class TuyenDungSerializer(serializers.ModelSerializer):
    ten_hoc_vien = serializers.CharField(source='id_hoc_vien.username', read_only=True)
    ho_va_ten_hoc_vien = serializers.CharField(source='id_hoc_vien.ho_va_ten', read_only=True)
    hinh_anh_hoc_vien = serializers.CharField(source='id_hoc_vien.hinh_anh_logo', read_only=True)
    ten_nha_tuyen_dung = serializers.CharField(source='id_nha_tuyen_dung.username', read_only=True)
    ho_va_ten_ntd = serializers.CharField(source='id_nha_tuyen_dung.ho_va_ten', read_only=True)
    hinh_anh_ntd = serializers.CharField(source='id_nha_tuyen_dung.hinh_anh_logo', read_only=True)
    ten_khoa_hoc = serializers.CharField(source='id_khoa_hoc.ten_khoa_hoc', read_only=True)

    class Meta:
        model = TuyenDung
        fields = [
            'id_tuyen_dung', 'id_nha_tuyen_dung', 'ten_nha_tuyen_dung', 'ho_va_ten_ntd', 'hinh_anh_ntd',
            'id_hoc_vien', 'ten_hoc_vien', 'ho_va_ten_hoc_vien', 'hinh_anh_hoc_vien',
            'id_khoa_hoc', 'ten_khoa_hoc', 'ngay_tuyen', 'ghi_chu', 'trang_thai'
        ]
        read_only_fields = ['id_nha_tuyen_dung', 'ngay_tuyen']


class KetQuaQuizSerializer(serializers.ModelSerializer):
    ten_bai_giang = serializers.CharField(source='id_bai_giang.ten_bai_giang', read_only=True)

    class Meta:
        model = KetQuaQuiz
        fields = '__all__'
