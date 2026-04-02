# Dự Án Hệ Sinh Thái Giáo Dục (EduChain)

Dự án bao gồm Frontend (ReactJS) và Backend (Django). Để bắt đầu phát triển hoặc chạy thử dự án, vui lòng làm theo các bước sau.

## 1. Cài đặt Cơ Sở Dữ Liệu (MySQL)
Dự án sử dụng MySQL. Nếu bạn đã nhận được tệp dump SQL (ví dụ: `chuyen_de_2_dump.sql`, `data_dump.json` hoặc chạy `seed_data.py`), hãy import nó vào database của bạn.

- Tạo database tên `chuyen_de_2` (hoặc tên tùy ý theo cấu hình `.env`).
- Dùng công cụ như MySQL Workbench, DBeaver, XAMPP hoặc CLI để import file SQL vào.

## 2. Thiết lập Backend (Django)

**Bước 1:** Mở terminal tại thư mục `backend/` và copy file mẫu `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Mở file `.env` vừa tạo và sửa lại thông tin đăng nhập MySQL cho đúng với máy của bạn (`DB_USER`, `DB_PASSWORD`...).

**Bước 2:** Cài đặt môi trường và chạy server:
```bash
# Tạo môi trường ảo (nếu chưa có)
python -m venv venv

# Kích hoạt môi trường ảo (Windows)
.\venv\Scripts\activate

# Cài đặt thư viện
pip install -r requirements.txt

# Chạy server
python manage.py runserver
```

## 3. Thiết lập Frontend (React/Vite)

**Bước 1:** Mở terminal khác tại thư mục `frontend/` và copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Bạn có thể sửa `VITE_API_BASE_URL` trỏ tới link Backend (mặc định là `http://localhost:8000`). Nếu deploy, hãy đảm bảo sửa lại URL này thành tên miền miền backend thực tế.

**Bước 2:** Cài đặt gói và chạy React:
```bash
# Cài đặt package
npm install

# Chạy server frontend
npm run dev
```

---
*Giao diện Frontend sẽ chạy ở http://localhost:3000 và Backend hoạt động ở http://localhost:8000.*
