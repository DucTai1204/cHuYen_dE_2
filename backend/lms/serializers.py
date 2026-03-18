from rest_framework import serializers
from .models import KhoaHoc, BaiGiang, KyNang, KyNangKhoaHoc, DangKyHoc, Chuong, TienDoBaiGiang


class KyNangSerializer(serializers.ModelSerializer):
    class Meta:
        model = KyNang
        fields = '__all__'


class BaiGiangSerializer(serializers.ModelSerializer):
    """Serializer cho bài giảng — có thêm trường is_locked (chỉ đọc, tính từ context)."""
    is_locked = serializers.SerializerMethodField()

    class Meta:
        model = BaiGiang
        fields = [
            'id_bai_giang', 'id_khoa_hoc', 'id_chuong',
            'ten_bai_giang', 'noi_dung_url', 'loai_bai',
            'thoi_luong_phut', 'thu_tu', 'la_xem_truoc',
            'video_watch_percentage', 'is_locked',
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
    tong_hoc_vien = serializers.ReadOnlyField()
    tong_chuong = serializers.ReadOnlyField()
    tong_bai = serializers.ReadOnlyField()
    ten_giang_vien = serializers.CharField(source='id_giang_vien.username', read_only=True)

    class Meta:
        model = KhoaHoc
        fields = '__all__'
        read_only_fields = ['id_giang_vien', 'ngay_tao', 'ngay_cap_nhat']


class KhoaHocListSerializer(serializers.ModelSerializer):
    """Serializer gọn cho danh sách marketplace (không nested bài giảng chi tiết)"""
    tong_hoc_vien = serializers.ReadOnlyField()
    tong_chuong = serializers.ReadOnlyField()
    tong_bai = serializers.ReadOnlyField()
    ten_giang_vien = serializers.CharField(source='id_giang_vien.username', read_only=True)

    class Meta:
        model = KhoaHoc
        fields = [
            'id_khoa_hoc', 'ten_khoa_hoc', 'mo_ta_ngan', 'gia_tien', 'gia_goc',
            'hinh_anh_thumbnail', 'trinh_do', 'danh_muc', 'cong_khai',
            'ngay_tao', 'ngay_cap_nhat', 'tong_hoc_vien', 'tong_chuong', 'tong_bai',
            'ten_giang_vien', 'is_sequential',
        ]


class DangKyHocSerializer(serializers.ModelSerializer):
    khoa_hoc = KhoaHocListSerializer(source='id_khoa_hoc', read_only=True)

    class Meta:
        model = DangKyHoc
        fields = '__all__'
        read_only_fields = ['id_nguoi_dung', 'ngay_dang_ky', 'trang_thai_hoc', 'phan_tram_hoan_thanh']


class TienDoBaiGiangSerializer(serializers.ModelSerializer):
    class Meta:
        model = TienDoBaiGiang
        fields = ['id', 'id_dang_ky', 'id_bai_giang', 'da_hoan_thanh', 'ngay_hoan_thanh']
        read_only_fields = ['id', 'ngay_hoan_thanh']
