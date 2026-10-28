# 14 Gói Landing Page Độc Lập CIC (`standalone-packages`)

Nhánh này chứa **14 bộ mã nguồn độc lập hoàn chỉnh** cho từng sản phẩm/giải pháp của CIC. Mỗi thư mục là một gói độc lập khép kín (chứa sẵn dữ liệu gốc `seed/seed-data.json`, kịch bản tự tạo bảng & nạp DB `seed/auto-seed.mjs`, cấu hình `.env` khóa riêng cho trang đó, và kịch bản chạy 1 chạm `start.bat` / `start.sh`).

## 1. Danh mục 14 Gói Độc lập & Tài khoản Quản trị

| # | Thư mục Gói Độc lập | Tên miền chính | Hạ tầng gốc | Tài khoản Admin | Mật khẩu | Cổng mặc định |
| :-: | :--- | :--- | :---: | :--- | :--- | :---: |
| 1 | [`cmsintellicad/`](./cmsintellicad) | `cmsintellicad.vn` | Host Mắt Bão | `cad_admin` | `cad@2026` | `:3005` |
| 2 | [`robotcongtrinh/`](./robotcongtrinh) | `robotcongtrinh.vn` | Host Mắt Bão | `robot_admin` | `robot@2026` | `:3006` |
| 3 | [`allplan/`](./allplan) | `allplan.cic.com.vn` | LadiPage | `allplan_admin` | `allplan@2026` | `:3007` |
| 4 | [`bim/`](./bim) | `bim.cic.com.vn` | LadiPage | `bim_admin` | `bim@2026` | `:3008` |
| 5 | [`enjicad/`](./enjicad) | `enjicad.vn` | LadiPage | `enjicad_admin` | `enjicad@2026` | `:3009` |
| 6 | [`escon/`](./escon) | `escon.cic.com.vn` | Host Mắt Bão | `escon_admin` | `escon@2026` | `:3010` |
| 7 | [`revit/`](./revit) | `revit.cic.com.vn` | Host Mắt Bão | `revit_admin` | `revit@2026` | `:3011` |
| 8 | [`autocad/`](./autocad) | `autocad.cic.com.vn` | Host Mắt Bão | `autocad_admin` | `autocad@2026` | `:3012` |
| 9 | [`cubicost/`](./cubicost) | `cubicost.cic.com.vn` | LadiPage | `cubicost_admin` | `cubicost@2026` | `:3013` |
| 10 | [`enjicadpro/`](./enjicadpro) | `enjicadpro.cic.com.vn` | LadiPage | `enjicadpro_admin` | `enjicadpro@2026` | `:3014` |
| 11 | [`piletest/`](./piletest) | `piletest.cic.com.vn` | LadiPage | `piletest_admin` | `piletest@2026` | `:3015` |
| 12 | [`foxit/`](./foxit) | `foxit.cic.com.vn` | LadiPage | `foxit_admin` | `foxit@2026` | `:3016` |
| 13 | [`maydocapngam/`](./maydocapngam) | `maydocapngam.cic.com.vn` | LadiPage | `maydocapngam_admin` | `maydocapngam@2026` | `:3017` |
| 14 | [`cabinetvision/`](./cabinetvision) | `cabinetvision.nghenoithat.vn` | LadiPage | `cabinetvision_admin` | `cabinetvision@2026` | `:3018` |

*(Tài khoản Quản trị Tổng `admin` / `cic@2026` cũng có thể đăng nhập trên mọi gói).*

---

## 2. Hướng dẫn Clone & Chạy bất kỳ Gói Độc lập nào

### Bước 1: Clone nhánh `standalone-packages` về máy hoặc Server
```bash
git clone -b standalone-packages https://github.com/namphan2k3/cic-ldp.git cic-standalone
cd cic-standalone
```

### Bước 2: Bật PostgreSQL / Supabase Self-Host (Nếu máy chưa có sẵn PostgreSQL)
```bash
docker compose -f infra/supabase/docker-compose.yml up -d
```

### Bước 3: Vào thư mục trang muốn chạy (ví dụ `allplan` hoặc `robotcongtrinh`) và khởi chạy
```bash
cd allplan
```

- **Cách 1 — Chạy tự động 1 lệnh (tự cài đặt thư viện + tự tạo bảng & seed DB + tự build + bật web)**:
  - Trên Windows:
    ```cmd
    start.bat
    ```
  - Trên Linux / Ubuntu Host:
    ```bash
    chmod +x start.sh
    ./start.sh
    ```

- **Cách 2 — Chạy từng bước qua `npm`**:
  ```bash
  npm install
  npm run db:seed
  npm run build
  npm start
  ```

Sau khi chạy, truy cập:
- **Trang chủ**: `http://localhost:<cổng>` (hoặc `https://<tên-miền-riêng>`)
- **Trang Quản trị CMS**: `http://localhost:<cổng>/admin` (hoặc `https://<tên-miền-riêng>/admin`)
