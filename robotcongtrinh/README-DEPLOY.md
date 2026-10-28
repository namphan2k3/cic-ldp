# Gói Triển Khai (robotcongtrinh)

Thư mục này đã đóng gói đầy đủ mã nguồn đã biên dịch (`.next`), cấu hình tên miền, nội dung (VI/EN), biểu mẫu, hình ảnh (`bytea`) và bộ tự động nạp dữ liệu (`seed/auto-seed.mjs`).

## Cách chạy trên Host (đã có chung Database PostgreSQL)

1. Mở file `.env` và kiểm tra chuỗi kết nối `DATABASE_URL` trỏ tới Database chung trên Host.
2. Chạy lệnh khởi động (hệ thống sẽ **tự động nạp dữ liệu vào Database** rồi bật máy chủ web):
   - **Trên Linux / Ubuntu Host**:
     ```bash
     chmod +x start.sh
     ./start.sh
     ```
   - **Trên Windows Server Host**:
     ```cmd
     start.bat
     ```
   - **Nếu chạy ngầm bằng PM2**:
     ```bash
     npm install && node seed/auto-seed.mjs && pm2 start ecosystem.config.cjs
     ```
