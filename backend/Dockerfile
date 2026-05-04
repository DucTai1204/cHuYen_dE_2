# Sử dụng image Python chính thức
FROM python:3.10-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt các thư viện hệ thống cần thiết và netcat để kiểm tra DB
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt và cài đặt dependency
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn backend
COPY . .

# Expose port mà Django chạy
EXPOSE 8080

# Lệnh khởi chạy server (có kiểm tra DB sẵn sàng)
CMD while ! nc -z db 3306; do echo "Waiting for database..."; sleep 2; done; python manage.py runserver 0.0.0.0:8080
