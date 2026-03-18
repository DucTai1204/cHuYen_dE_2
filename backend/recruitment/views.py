from rest_framework import permissions
from lms.models import KyNangKhoaHoc, DangKyHoc
from certificates.serializers import ChungChiSoSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

class TraCuuUngVienView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.vai_tro not in ['DoanhNghiep', 'QuanTri', 'NguoiXacThuc'] and not request.user.id_to_chuc:
            return Response({"error": "Không có quyền truy cập cổng doanh nghiệp"}, status=403)
            
        ky_nang_id = request.query_params.get('ky_nang_id')
        if not ky_nang_id:
            return Response({"error": "Vui lòng cung cấp ky_nang_id để tìm kiếm"}, status=400)
            
        khoa_hoc_ids = KyNangKhoaHoc.objects.filter(id_ky_nang=ky_nang_id).values_list('id_khoa_hoc', flat=True)
        
        # Tối ưu N+1 truy vấn: Sử dụng select_related
        danh_sach_dat_duoc = DangKyHoc.objects.filter(
            id_khoa_hoc__in=khoa_hoc_ids, 
            trang_thai_hoc='DaXong',
            chung_chi__isnull=False
        ).select_related('id_nguoi_dung', 'id_khoa_hoc')
        
        results = []
        for dk in danh_sach_dat_duoc:
            cert = dk.chung_chi.first()
            if cert:
                results.append({
                    "ho_ten": dk.id_nguoi_dung.ho_va_ten,
                    "email": dk.id_nguoi_dung.email,
                    "khoa_hoc": dk.id_khoa_hoc.ten_khoa_hoc,
                    "chung_chi": ChungChiSoSerializer(cert).data
                })
                
        return Response({"ung_vien": results})
