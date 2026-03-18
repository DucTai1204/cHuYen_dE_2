from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([AllowAny])
def proctoring_webhook(request):
    """
    Webhook để AI service đẩy cảnh báo gian lận.
    """
    data = request.data
    user_id = data.get('user_id')
    warning_type = data.get('warning_type')
    
    if not user_id or not warning_type:
        return Response({"error": "Thiếu dữ liệu (user_id, warning_type)"}, status=status.HTTP_400_BAD_REQUEST)
        
    # TODO: Thiết kế thêm table CanhBao trong tương lai để ghi nhận
    # Hiện tại mock ACK
    return Response({"status": "Đã nhận webhook cảnh báo từ AI", "data": data}, status=status.HTTP_200_OK)
