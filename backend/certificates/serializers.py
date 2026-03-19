from rest_framework import serializers
from .models import MauChungChi, ChungChiSo, NhatKyXacThuc

class MauChungChiSerializer(serializers.ModelSerializer):
    class Meta:
        model = MauChungChi
        fields = '__all__'

class ChungChiSoSerializer(serializers.ModelSerializer):
    ten_khoa_hoc = serializers.CharField(source='id_dang_ky.id_khoa_hoc.ten_khoa_hoc', read_only=True)
    ten_to_chuc_cap = serializers.CharField(source='id_dang_ky.id_khoa_hoc.id_giang_vien.id_to_chuc.ten_to_chuc', read_only=True)
    ho_va_ten_hoc_vien = serializers.CharField(source='id_dang_ky.id_nguoi_dung.ho_va_ten', read_only=True)
    chuoi_hash_blockchain = serializers.CharField(read_only=True)
    ma_uuid_chung_chi = serializers.CharField(read_only=True)
    link_xac_thuc = serializers.CharField(read_only=True)

    class Meta:
        model = ChungChiSo
        fields = [
            'ma_uuid_chung_chi', 'id_dang_ky', 'ten_khoa_hoc', 'ho_va_ten_hoc_vien',
            'ten_to_chuc_cap', 'ngay_cap', 'ngay_het_han', 'link_xac_thuc', 
            'chuoi_hash_blockchain', 'trang_thai'
        ]

class NhatKyXacThucSerializer(serializers.ModelSerializer):
    class Meta:
        model = NhatKyXacThuc
        fields = '__all__'
