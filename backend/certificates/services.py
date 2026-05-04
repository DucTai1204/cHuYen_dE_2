import uuid
import hashlib
import logging
from django.utils import timezone
from .models import MauChungChi, ChungChiSo

logger = logging.getLogger(__name__)

def cap_chung_chi_tu_dong(dang_ky):
    # Kiểm tra xem khóa học đã có mẫu chứng chỉ chưa
    logger.info(f"Đang kiểm tra cấp chứng chỉ tự động cho: {dang_ky.id_nguoi_dung.username} - Khóa học: {dang_ky.id_khoa_hoc.ten_khoa_hoc}")
    mau = MauChungChi.objects.filter(id_khoa_hoc=dang_ky.id_khoa_hoc).first()
    # Nếu chưa có mẫu, ta có thể bỏ qua hoặc dùng mẫu mặc định. 
    # Tạm thời cứ cho phép cấp mà không có mẫu để user "show" được phần này.



    # Kiểm tra xem user này đã được cấp chứng chỉ cho đợt đăng ký này chưa
    if ChungChiSo.objects.filter(id_dang_ky=dang_ky).exists():
        return None
    
    # Sinh UUID duy nhất
    ma_uuid = str(uuid.uuid4())
    
    # Sinh mã băm bảo mật (Hash) cho chứng chỉ
    data_to_hash = f"{ma_uuid}-{dang_ky.id_nguoi_dung.username}-{dang_ky.id_khoa_hoc.ten_khoa_hoc}-{timezone.now().isoformat()}".encode('utf-8')
    chuoi_hash = hashlib.sha256(data_to_hash).hexdigest()

    # Base link tra cứu (sẽ thay bằng FE domain thực tế sau)
    link_xac_thuc = f"/xac-thuc/{ma_uuid}"

    chung_chi = ChungChiSo.objects.create(
        ma_uuid_chung_chi=ma_uuid,
        id_dang_ky=dang_ky,
        id_mau=mau,
        link_xac_thuc=link_xac_thuc,
        chuoi_hash_blockchain=chuoi_hash,
        trang_thai='HieuLuc'
    )
    logger.info(f"Cấp chứng chỉ thành công cho '{dang_ky.id_nguoi_dung.username}' - UUID: {ma_uuid}")
    return chung_chi

