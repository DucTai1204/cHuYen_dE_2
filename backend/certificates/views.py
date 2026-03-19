from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import MauChungChi, ChungChiSo, NhatKyXacThuc
from .serializers import MauChungChiSerializer, ChungChiSoSerializer

class MauChungChiViewSet(viewsets.ModelViewSet):
    queryset = MauChungChi.objects.all()
    serializer_class = MauChungChiSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChungChiSoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ChungChiSo.objects.all()
    serializer_class = ChungChiSoSerializer

    def get_queryset(self):
        user = self.request.user
        id_user = self.request.query_params.get('id_user')
        
        # Nếu là học viên, chỉ cho phép xem chứng chỉ của chính mình
        if getattr(user, 'vai_tro', '') == 'HocVien':
            return self.queryset.filter(id_dang_ky__id_nguoi_dung=user)
            
        # Với các vai trò khác (NTD, Admin), cho phép lọc theo id_user
        if id_user:
            return self.queryset.filter(id_dang_ky__id_nguoi_dung_id=id_user)
            
        return self.queryset.order_by('-ngay_cap')

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def xac_thuc_chung_chi(request, uuid):
    try:
        chung_chi = ChungChiSo.objects.get(ma_uuid_chung_chi=uuid)
        
        # Log verification access
        nguoi_kiem_tra = "Guest IP: " + request.META.get('REMOTE_ADDR', '')
        if request.user.is_authenticated:
            nguoi_kiem_tra = f"User {request.user.username} ({request.user.vai_tro})"
        
        NhatKyXacThuc.objects.create(
            ma_uuid_chung_chi=chung_chi,
            nguoi_kiem_tra=nguoi_kiem_tra,
            ly_do="Xác thực điện tử"
        )
        
        return Response({
            "hop_le": True,
            "chung_chi": ChungChiSoSerializer(chung_chi).data
        }, status=status.HTTP_200_OK)
    except ChungChiSo.DoesNotExist:
        return Response({"hop_le": False, "error": "Mã UUID không tồn tại hoặc đã bị thu hồi"}, status=status.HTTP_404_NOT_FOUND)
