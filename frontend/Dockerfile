# Sử dụng image Node.js chính thức
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependency
RUN npm install

# Copy toàn bộ mã nguồn frontend
COPY . .

# Expose port mà Vite chạy (theo cấu hình vite.config.js là 3000)
EXPOSE 3000

# Lệnh khởi chạy dev server
CMD ["npm", "run", "dev"]
