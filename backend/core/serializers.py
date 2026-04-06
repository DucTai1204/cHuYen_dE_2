from rest_framework import serializers
from .models import NguoiDung

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = NguoiDung
        fields = ('username', 'password', 'email', 'ho_va_ten', 'vai_tro')

    def create(self, validated_data):
        user = NguoiDung.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            ho_va_ten=validated_data.get('ho_va_ten', ''),
            vai_tro=validated_data.get('vai_tro', 'HocVien')
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NguoiDung
        fields = [
            'id_nguoi_dung', 'username', 'email', 'ho_va_ten', 
            'vai_tro', 'bio', 'hinh_anh_logo', 'ky_nang', 'ready_to_work', 'id_to_chuc'
        ]
        read_only_fields = ['id_nguoi_dung', 'username', 'vai_tro']

