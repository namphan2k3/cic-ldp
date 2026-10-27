# Hướng dẫn Triển khai lên Máy chủ Viettel (Self-host Server)

Tài liệu này hướng dẫn chuyển toàn bộ hệ thống đã dựng ở máy cá nhân (`d:\web-data\cic-web` + `d:\web-data\cic-platform`) lên máy chủ Linux (Ubuntu 22.04/24.04) tại Viettel IDC của công ty.

---

## 1. Kiến trúc Dịch vụ trên Server

| Dịch vụ | Cổng nội bộ | Tên miền ánh xạ (Nginx) | Vai trò |
|---|---|---|---|
| `supabase-db` | `54322` | Nội bộ Docker | PostgreSQL 15 dùng chung toàn hệ sinh thái (94 bảng `public`) |
| `supabase-kong` | `8000` | Nội bộ / API | Cổng Supabase Auth & PostgREST |
| `supabase-studio` | `54323` | Nội bộ / VPN | Giao diện quản trị DB trực quan |
| `cic-web` | `4300` | `cic.com.vn` | Website & CMS chính của Công ty CIC |
| `landing-hub` | `4301` | `cmsintellicad.vn`, `robotcongtrinh.vn`, `enjicad.vn`, `allplan.cic.com.vn`, `bim.cic.com.vn`, `escon.cic.com.vn`, `revit.cic.com.vn` | 1 source chạy toàn bộ 7+ trang Landing Page |
| `data-hub` | `4302` | `data.cic.com.vn` | Web quản trị đồng bộ Google Sheets, cấu hình Sites, xuất Excel & Sao lưu |
| `sync-worker` | Chạy nền | — | Đồng bộ Sheet tự động, đẩy form lên Sheet/Email, kiểm tra sức khỏe site, chạy backup |

---

## 2. Các bước chuyển từ Máy cá nhân lên Server Viettel

### Bước 1: Tạo bản Backup mới nhất tại máy cá nhân
1. Mở giao diện **CIC Data Hub** tại `http://localhost:4302/backups`.
2. Bấm **"Tạo bản Backup Database (.dump)"** (lưu tại `cic-platform/infra/supabase/backups/db/cic_postgres_YYYYMMDD_HHmmss.dump`).

### Bước 2: Copy mã nguồn & bản Backup lên Server
Copy 2 thư mục `cic-web` và `cic-platform` (bao gồm thư mục `credentials/` chứa key Google Service Account và file `.dump` vừa tạo) lên `/opt/cic/` trên server:
```bash
scp -r cic-web cic-platform root@<IP_SERVER_VIETTEL>:/opt/cic/
```

### Bước 3: Khởi động cụm Supabase Self-host & Khôi phục dữ liệu
Trên máy chủ Viettel:
```bash
cd /opt/cic/cic-platform/infra/supabase
cp .env.example .env
# Chỉnh POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY trong .env
docker compose up -d

# Khôi phục toàn bộ 94 bảng + dữ liệu từ bản backup máy cá nhân
cd /opt/cic/cic-platform/infra/scripts
chmod +x up.sh backup.sh restore.sh
./restore.sh ../supabase/backups/db/cic_postgres_<TIMESTAMP>.dump
```

### Bước 4: Build & Chạy các ứng dụng Web
```bash
cd /opt/cic/cic-platform
npm install
npm run build:landing
npm run build:data-hub
./infra/scripts/up.sh
```

### Bước 5: Trỏ DNS các tên miền về IP Server Viettel
Trỏ bản ghi `A` của `cic.com.vn`, `data.cic.com.vn`, `cmsintellicad.vn`, `robotcongtrinh.vn`, `enjicad.vn`, `allplan.cic.com.vn`, `bim.cic.com.vn`, `escon.cic.com.vn`, `revit.cic.com.vn` về IP Public của máy chủ Viettel và chạy Certbot cấp chứng chỉ SSL:
```bash
certbot --nginx -d cic.com.vn -d data.cic.com.vn -d cmsintellicad.vn -d robotcongtrinh.vn -d enjicad.vn
```
