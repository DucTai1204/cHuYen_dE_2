import logging
from django.db import models as db_models
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    KhoaHoc, BaiGiang, DangKyHoc, Chuong, 
    TienDoBaiGiang, DanhGiaKhoaHoc, TinNhan, DanhGiaNhaTuyenDung,
    TuyenDung
)
from .serializers import (
    KhoaHocSerializer, KhoaHocListSerializer,
    BaiGiangSerializer, DangKyHocSerializer, ChuongSerializer,
    TienDoBaiGiangSerializer, DanhGiaKhoaHocSerializer, 
    TinNhanSerializer, DanhGiaNhaTuyenDungSerializer,
    TuyenDungSerializer
)
from core.permissions import IsGiangVien
from certificates.services import cap_chung_chi_tu_dong

logger = logging.getLogger(__name__)



class KhoaHocViewSet(viewsets.ModelViewSet):
    queryset = KhoaHoc.objects.all()

    def get_serializer_class(self):
        # Seller (GiangVien) xem/sửa khóa học của mình → full serializer
        if self.request.user.is_authenticated and getattr(self.request.user, 'vai_tro', '') == 'GiangVien':
            return KhoaHocSerializer
        # Student và public → serializer gọn (không nested chapters/lessons)
        return KhoaHocListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'publish', 'unpublish', 'my_courses']:
            return [permissions.IsAuthenticated(), IsGiangVien()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        user = self.request.user
        vai_tro = getattr(user, 'vai_tro', '') if user.is_authenticated else ''

        # my_courses: chỉ lấy khóa học của giảng viên đang đăng nhập
        if self.action == 'my_courses':
            return KhoaHoc.objects.filter(id_giang_vien=user)

        # Giảng viên sửa/xem khóa học của chính mình (kể cả draft)
        if vai_tro == 'GiangVien' and self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'publish', 'unpublish']:
            return KhoaHoc.objects.filter(
                db_models.Q(cong_khai=True) | db_models.Q(id_giang_vien=user)
            )

        # Tất cả các trường hợp còn lại (student list/retrieve, public)
        # → CHỈ trả khóa học đã công khai
        return KhoaHoc.objects.filter(cong_khai=True)

    def perform_create(self, serializer):
        # Tự động gán giảng viên = user hiện tại
        serializer.save(id_giang_vien=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-courses')
    def my_courses(self, request):
        """Lấy tất cả khóa học của giảng viên đang đăng nhập (cả draft và public)"""
        queryset = KhoaHoc.objects.filter(id_giang_vien=request.user).order_by('-ngay_tao')
        serializer = KhoaHocSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        khoa_hoc = self.get_object()
        if khoa_hoc.id_giang_vien != request.user:
            return Response({'error': 'Bạn không có quyền publish khóa học này.'}, status=status.HTTP_403_FORBIDDEN)
        khoa_hoc.cong_khai = True
        khoa_hoc.save()
        return Response({'status': 'published', 'message': 'Khóa học đã được đăng lên marketplace.'})

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        khoa_hoc = self.get_object()
        if khoa_hoc.id_giang_vien != request.user:
            return Response({'error': 'Bạn không có quyền.'}, status=status.HTTP_403_FORBIDDEN)
        khoa_hoc.cong_khai = False
        khoa_hoc.save()
        return Response({'status': 'unpublished', 'message': 'Khóa học đã ẩn khỏi marketplace.'})


class ChuongViewSet(viewsets.ModelViewSet):
    queryset = Chuong.objects.all()
    serializer_class = ChuongSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsGiangVien()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        user = self.request.user
        vai_tro = getattr(user, 'vai_tro', '') if user.is_authenticated else ''
        khoa_hoc_id = self.request.query_params.get('khoa_hoc')

        if khoa_hoc_id:
            qs = Chuong.objects.filter(id_khoa_hoc=khoa_hoc_id).order_by('thu_tu')
            # GiangVien xem được chapter của khóa học mình dạy (kể cả draft)
            if vai_tro == 'GiangVien':
                return qs
            # Student và public chỉ xem chapter của khóa học đã công khai
            return qs.filter(id_khoa_hoc__cong_khai=True)

        # Không có query param: GiangVien xem của mình, student không xem all
        if vai_tro == 'GiangVien':
            return Chuong.objects.filter(id_khoa_hoc__id_giang_vien=user).order_by('thu_tu')
        return Chuong.objects.filter(id_khoa_hoc__cong_khai=True).order_by('thu_tu')

    def get_serializer_context(self):
        """
        Truyền thêm context is_sequential, completed_ids, sorted_lessons
        để BaiGiangSerializer tính trường is_locked.
        """
        ctx = super().get_serializer_context()
        user = self.request.user
        if not user.is_authenticated:
            return ctx

        khoa_hoc_id = self.request.query_params.get('khoa_hoc')
        if not khoa_hoc_id:
            return ctx

        try:
            khoa_hoc = KhoaHoc.objects.get(pk=khoa_hoc_id)
        except KhoaHoc.DoesNotExist:
            return ctx

        ctx['is_sequential'] = khoa_hoc.is_sequential

        # Lấy tất cả bài giảng đã sắp xếp (across chapters)
        sorted_lessons = list(
            BaiGiang.objects.filter(id_khoa_hoc=khoa_hoc).order_by('id_chuong__thu_tu', 'thu_tu')
        )
        ctx['sorted_lessons'] = sorted_lessons

        # Lấy tiến độ của user trong khóa học này
        try:
            dang_ky = DangKyHoc.objects.get(id_nguoi_dung=user, id_khoa_hoc=khoa_hoc)
            completed_ids = set(
                TienDoBaiGiang.objects.filter(
                    id_dang_ky=dang_ky, da_hoan_thanh=True
                ).values_list('id_bai_giang', flat=True)
            )
        except DangKyHoc.DoesNotExist:
            completed_ids = set()

        ctx['completed_ids'] = completed_ids
        return ctx


class BaiGiangViewSet(viewsets.ModelViewSet):
    queryset = BaiGiang.objects.all()
    serializer_class = BaiGiangSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsGiangVien()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        # Lọc theo chương nếu có query param
        chuong_id = self.request.query_params.get('chuong')
        if chuong_id:
            return BaiGiang.objects.filter(id_chuong=chuong_id).order_by('thu_tu')
        khoa_hoc_id = self.request.query_params.get('khoa_hoc')
        if khoa_hoc_id:
            return BaiGiang.objects.filter(id_khoa_hoc=khoa_hoc_id).order_by('thu_tu')
        return BaiGiang.objects.all()

    def get_serializer_context(self):
        """Truyền context để tính is_locked như ChuongViewSet."""
        ctx = super().get_serializer_context()
        user = self.request.user
        if not user.is_authenticated:
            return ctx

        khoa_hoc_id = self.request.query_params.get('khoa_hoc')
        if not khoa_hoc_id:
            return ctx

        try:
            khoa_hoc = KhoaHoc.objects.get(pk=khoa_hoc_id)
        except KhoaHoc.DoesNotExist:
            return ctx

        ctx['is_sequential'] = khoa_hoc.is_sequential
        sorted_lessons = list(
            BaiGiang.objects.filter(id_khoa_hoc=khoa_hoc).order_by('id_chuong__thu_tu', 'thu_tu')
        )
        ctx['sorted_lessons'] = sorted_lessons

        try:
            dang_ky = DangKyHoc.objects.get(id_nguoi_dung=user, id_khoa_hoc=khoa_hoc)
            completed_ids = set(
                TienDoBaiGiang.objects.filter(
                    id_dang_ky=dang_ky, da_hoan_thanh=True
                ).values_list('id_bai_giang', flat=True)
            )
        except DangKyHoc.DoesNotExist:
            completed_ids = set()

        ctx['completed_ids'] = completed_ids
        return ctx


class DangKyHocViewSet(viewsets.ModelViewSet):
    queryset = DangKyHoc.objects.all()
    serializer_class = DangKyHocSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        vai_tro = getattr(user, 'vai_tro', '')
        # Giảng viên xem danh sách học viên của khóa học mình dạy
        if vai_tro == 'GiangVien':
            return self.queryset.filter(id_khoa_hoc__id_giang_vien=user)
        # Mọi user khác (HocVien, QuanTri, v.v.) chỉ xem đăng ký của chính mình
        return self.queryset.filter(id_nguoi_dung=user)

    def perform_create(self, serializer):
        serializer.save(id_nguoi_dung=self.request.user)

    def create(self, request, *args, **kwargs):
        # Chỉ học viên mới được đăng ký
        vai_tro = getattr(request.user, 'vai_tro', '')
        if vai_tro == 'GiangVien':
            return Response({'detail': 'Giảng viên không thể đăng ký khóa học.'}, status=status.HTTP_403_FORBIDDEN)
        # Kiểm tra đã đăng ký chưa
        course_id = request.data.get('id_khoa_hoc')
        if DangKyHoc.objects.filter(id_nguoi_dung=request.user, id_khoa_hoc=course_id).exists():
            return Response({'detail': 'Bạn đã đăng ký khóa học này rồi.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def cap_nhat_tien_do(self, request, pk=None):
        dang_ky = self.get_object()
        phan_tram = request.data.get('phan_tram_hoan_thanh')

        if dang_ky.id_nguoi_dung != request.user:
            return Response({'error': 'Không có quyền cập nhật'}, status=status.HTTP_403_FORBIDDEN)

        if phan_tram is not None:
            dang_ky.phan_tram_hoan_thanh = float(phan_tram)
            if dang_ky.phan_tram_hoan_thanh >= 100:
                dang_ky.trang_thai_hoc = 'DaXong'
                dang_ky.phan_tram_hoan_thanh = 100.0
                cap_chung_chi_tu_dong(dang_ky)
            dang_ky.save()
            return Response({'status': 'Thành công', 'phan_tram': dang_ky.phan_tram_hoan_thanh})
        return Response({'error': 'Thiếu phan_tram_hoan_thanh'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='all-talent')
    def all_talent(self, request):
        """Lấy danh sách tất cả học viên đã hoàn thành (100% tiến độ) kèm bộ lọc nâng cao"""
        user_role = getattr(request.user, 'vai_tro', '')
        if user_role not in ['NhaTuyenDung', 'QuanTri', 'GiangVien']:
             return Response({'detail': 'Bạn không có quyền xem danh sách nhân tài.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Lấy các tham số lọc từ request
        khoa_hoc_id = request.query_params.get('id_khoa_hoc')
        skill_search = request.query_params.get('skill')
        trinh_do = request.query_params.get('level')
        ready = request.query_params.get('ready') # 'true' | 'false'
        search_name = request.query_params.get('search')

        from django.db.models import Q
        queryset = DangKyHoc.objects.filter(
            Q(trang_thai_hoc='DaXong') | Q(phan_tram_hoan_thanh__gte=100)
        ).select_related('id_nguoi_dung', 'id_khoa_hoc')

        # Áp dụng các bộ lọc nếu có
        if khoa_hoc_id:
            queryset = queryset.filter(id_khoa_hoc_id=khoa_hoc_id)
        if trinh_do:
            queryset = queryset.filter(id_khoa_hoc__trinh_do=trinh_do)
        if ready:
            is_ready = ready.lower() == 'true'
            queryset = queryset.filter(id_nguoi_dung__ready_to_work=is_ready)
        if skill_search:
            queryset = queryset.filter(id_nguoi_dung__ky_nang__icontains=skill_search)
        if search_name:
            queryset = queryset.filter(
                Q(id_nguoi_dung__ho_va_ten__icontains=search_name) | 
                Q(id_nguoi_dung__username__icontains=search_name)
            )

        # Sắp xếp theo ngày đăng ký (có thể coi là ngày hoàn thành nếu cập nhật logic 100%)
        queryset = queryset.order_by('-ngay_dang_ky')
        
        data = []
        for dk in queryset:
            u = dk.id_nguoi_dung
            data.append({
                'id_user': u.id_nguoi_dung,
                'ho_va_ten': u.ho_va_ten or u.username,
                'username': u.username,
                'email': u.email,
                'bio': getattr(u, 'bio', ''),
                'ky_nang': getattr(u, 'ky_nang', ''),
                'ready_to_work': getattr(u, 'ready_to_work', True),
                'ten_khoa_hoc': dk.id_khoa_hoc.ten_khoa_hoc,
                'trinh_do': dk.id_khoa_hoc.trinh_do,
                'ngay_hoan_thanh': dk.ngay_dang_ky,
                'id_khoa_hoc': dk.id_khoa_hoc.id_khoa_hoc,
                'trung_binh_sao_ntd': dk.id_khoa_hoc.trung_binh_sao_ntd,
                'tong_so_danh_gia_ntd': dk.id_khoa_hoc.tong_so_danh_gia_ntd,
                'so_nguoi_co_viec_lam': dk.id_khoa_hoc.so_nguoi_co_viec_lam
            })
        return Response(data)


class TienDoBaiGiangViewSet(viewsets.GenericViewSet):
    """
    ViewSet chuyên xử lý việc đánh dấu hoàn thành từng bài giảng.
    POST /lms/tien-do-bai/hoan_thanh/ → Đánh dấu bài đã hoàn thành + tính lại % khóa học.
    GET  /lms/tien-do-bai/?khoa_hoc=<id> → Lấy danh sách bài đã hoàn thành của user trong khóa học.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TienDoBaiGiangSerializer
    queryset = TienDoBaiGiang.objects.all()

    def list(self, request):
        khoa_hoc_id = request.query_params.get('khoa_hoc')
        if not khoa_hoc_id:
            return Response({'error': 'Cần truyền query param ?khoa_hoc=<id>'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            dang_ky = DangKyHoc.objects.get(id_nguoi_dung=request.user, id_khoa_hoc=khoa_hoc_id)
        except DangKyHoc.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

        records = TienDoBaiGiang.objects.filter(id_dang_ky=dang_ky, da_hoan_thanh=True)
        # Trả về chỉ danh sách id bài đã hoàn thành cho tiện dùng ở FE
        completed = list(records.values_list('id_bai_giang', flat=True))
        return Response({'completed_lesson_ids': completed})

    @action(detail=False, methods=['post'], url_path='hoan_thanh')
    def hoan_thanh(self, request):
        """
        Body: { "id_bai_giang": <int>, "id_khoa_hoc": <int> }
        Logic:
            1. Lấy DangKyHoc
            2. Kiểm tra điều kiện khóa tuần tự (nếu bật): bài trước phải xong trước
            3. Tạo/update TienDoBaiGiang → da_hoan_thanh = True
            4. Tính lại % hoàn thành tổng trong DangKyHoc
        """
        bai_id = request.data.get('id_bai_giang')
        khoa_id = request.data.get('id_khoa_hoc')

        if not bai_id or not khoa_id:
            return Response({'error': 'Thiếu id_bai_giang hoặc id_khoa_hoc'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bai_giang = BaiGiang.objects.get(pk=bai_id)
        except BaiGiang.DoesNotExist:
            return Response({'error': 'Không tìm thấy bài giảng'}, status=status.HTTP_404_NOT_FOUND)

        try:
            dang_ky = DangKyHoc.objects.get(id_nguoi_dung=request.user, id_khoa_hoc=khoa_id)
        except DangKyHoc.DoesNotExist:
            return Response({'error': 'Bạn chưa đăng ký khóa học này'}, status=status.HTTP_403_FORBIDDEN)

        khoa_hoc = dang_ky.id_khoa_hoc

        # ── Kiểm tra học tuần tự ──
        if khoa_hoc.is_sequential:
            sorted_lessons = list(
                BaiGiang.objects.filter(id_khoa_hoc=khoa_hoc).order_by('id_chuong__thu_tu', 'thu_tu')
            )
            ids_list = [l.id_bai_giang for l in sorted_lessons]
            try:
                idx = ids_list.index(int(bai_id))
            except ValueError:
                return Response({'error': 'Bài giảng không thuộc khóa học này'}, status=status.HTTP_400_BAD_REQUEST)

            if idx > 0:
                prev_id = ids_list[idx - 1]
                prev_done = TienDoBaiGiang.objects.filter(
                    id_dang_ky=dang_ky, id_bai_giang=prev_id, da_hoan_thanh=True
                ).exists()
                if not prev_done:
                    return Response(
                        {'error': 'Bạn phải hoàn thành bài trước mới có thể mở bài này (chế độ học tuần tự).'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        # ── Đánh dấu hoàn thành ──
        tien_do, _ = TienDoBaiGiang.objects.get_or_create(
            id_dang_ky=dang_ky, id_bai_giang=bai_giang
        )
        if not tien_do.da_hoan_thanh:
            tien_do.da_hoan_thanh = True
            tien_do.ngay_hoan_thanh = timezone.now()
            tien_do.save()

        # ── Tính lại % tổng ──
        tong_bai = BaiGiang.objects.filter(id_khoa_hoc=khoa_hoc).count()
        da_xong = TienDoBaiGiang.objects.filter(id_dang_ky=dang_ky, da_hoan_thanh=True).count()
        if tong_bai > 0:
            phan_tram = round(da_xong / tong_bai * 100, 1)
        else:
            phan_tram = 0.0

        dang_ky.phan_tram_hoan_thanh = phan_tram
        if phan_tram >= 100:
            dang_ky.trang_thai_hoc = 'DaXong'
            phan_tram = 100.0
            dang_ky.phan_tram_hoan_thanh = 100.0
            cap_chung_chi_tu_dong(dang_ky)
        dang_ky.save()

        return Response({
            'status': 'success',
            'id_bai_giang': int(bai_id),
            'phan_tram_hoan_thanh': phan_tram,
            'message': 'Hoàn thành bài học!',
        })


class DanhGiaKhoaHocViewSet(viewsets.ModelViewSet):
    queryset = DanhGiaKhoaHoc.objects.all()
    serializer_class = DanhGiaKhoaHocSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        khoa_hoc_id = self.request.query_params.get('khoa_hoc')
        if khoa_hoc_id:
            return self.queryset.filter(id_khoa_hoc=khoa_hoc_id).order_by('-ngay_tao')
        return self.queryset.all().order_by('-ngay_tao')

    def perform_create(self, serializer):
        # Tự động gán người dùng hiện tại
        serializer.save(id_nguoi_dung=self.request.user)

    def create(self, request, *args, **kwargs):
        # Kiểm tra xem user đã đánh giá khóa học này chưa
        khoa_hoc_id = request.data.get('id_khoa_hoc')
        if DanhGiaKhoaHoc.objects.filter(id_nguoi_dung=request.user, id_khoa_hoc=khoa_hoc_id).exists():
            return Response(
                {'detail': 'Bạn đã đánh giá khóa học này rồi.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)


class TinNhanViewSet(viewsets.ModelViewSet):
    queryset = TinNhan.objects.all()
    serializer_class = TinNhanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q
        return TinNhan.objects.filter(Q(id_nguoi_gui=user) | Q(id_nguoi_nhan=user)).order_by('-ngay_gui')

    def perform_create(self, serializer):
        serializer.save(id_nguoi_gui=self.request.user)


class DanhGiaNhaTuyenDungViewSet(viewsets.ModelViewSet):
    queryset = DanhGiaNhaTuyenDung.objects.all()
    serializer_class = DanhGiaNhaTuyenDungSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        khoa_hoc_id = self.request.query_params.get('khoa_hoc')
        if khoa_hoc_id:
            return self.queryset.filter(id_khoa_hoc=khoa_hoc_id).order_by('-ngay_tao')
        return self.queryset.all().order_by('-ngay_tao')

    def perform_create(self, serializer):
        # Chỉ cho phép Nhà tuyển dụng đánh giá
        if getattr(self.request.user, 'vai_tro', '') != 'NhaTuyenDung':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Chỉ Nhà tuyển dụng mới có quyền thực hiện đánh giá này.")
        
        # KIỂM TRA: Đã tuyển dụng người từ khóa học này chưa?
        khoa_hoc_id = self.request.data.get('id_khoa_hoc')
        if not TuyenDung.objects.filter(id_nha_tuyen_dung=self.request.user, id_khoa_hoc=khoa_hoc_id).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Bạn phải tuyển dụng ít nhất một học viên từ khóa học này mới có thể để lại đánh giá chuyên môn.")
            
        serializer.save(id_nha_tuyen_dung=self.request.user)

    def create(self, request, *args, **kwargs):
        khoa_hoc_id = request.data.get('id_khoa_hoc')
        if DanhGiaNhaTuyenDung.objects.filter(id_nha_tuyen_dung=request.user, id_khoa_hoc=khoa_hoc_id).exists():
            return Response(
                {'detail': 'Bạn đã đánh giá khóa học này rồi.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)


class TuyenDungViewSet(viewsets.ModelViewSet):
    queryset = TuyenDung.objects.all()
    serializer_class = TuyenDungSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        khoa_hoc_id = self.request.query_params.get('khoa_hoc')
        trang_thai = self.request.query_params.get('trang_thai')
        
        # Lọc cơ bản theo vai trò
        from django.db.models import Q
        queryset = self.queryset.filter(Q(id_nha_tuyen_dung=user) | Q(id_hoc_vien=user))
        
        # Lọc mở rộng cho public (xem công ty nào tuyển từ khóa học này)
        if khoa_hoc_id:
            # Nếu truyền khoa_hoc, cho phép xem các bản ghi DaDongY của khóa đó (không quan tâm user nào)
            return TuyenDung.objects.filter(id_khoa_hoc=khoa_hoc_id, trang_thai='DaDongY').order_by('-ngay_tuyen')
            
        if trang_thai:
            queryset = queryset.filter(trang_thai=trang_thai)
            
        return queryset.order_by('-ngay_tuyen')

    def perform_create(self, serializer):
        if getattr(self.request.user, 'vai_tro', '') != 'NhaTuyenDung':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Chỉ Nhà tuyển dụng mới có quyền thực hiện hành động này.")
        serializer.save(id_nha_tuyen_dung=self.request.user)
