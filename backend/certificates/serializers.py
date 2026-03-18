from rest_framework import serializers
from .models import MauChungChi, ChungChiSo, NhatKyXacThuc

class MauChungChiSerializer(serializers.ModelSerializer):
    class Meta:
        model = MauChungChi
        fields = '__all__'

class ChungChiSoSerializer(serializers.ModelSerializer):
    chuoi_hash_blockchain = serializers.CharField(read_only=True)
    ma_uuid_chung_chi = serializers.CharField(read_only=True)
    link_xac_thuc = serializers.CharField(read_only=True)
    class Meta:
        model = ChungChiSo
        fields = '__all__'

class NhatKyXacThucSerializer(serializers.ModelSerializer):
    class Meta:
        model = NhatKyXacThuc
        fields = '__all__'
