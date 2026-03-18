from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Mở rộng JWT payload để thêm vai_tro, ho_va_ten, username
    vào trong token — frontend có thể decode lấy thông tin user ngay.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Thêm custom claims vào payload
        token['username'] = user.username
        token['ho_va_ten'] = user.ho_va_ten or user.username
        token['vai_tro'] = user.vai_tro
        token['email'] = user.email or ''

        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
