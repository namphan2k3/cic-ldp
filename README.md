# CIC Landing Platform (`cic-ldp`)

Nền tảng quản trị tập trung (**Master Hub**) và đóng gói triển khai độc lập (**Standalone Package Exporter**) cho **14 hệ thống Landing Page sản phẩm/giải pháp của Công ty Cổ phần Công nghệ và Tư vấn CIC**, tích hợp trình chỉnh sửa trực quan (**Visual CMS Builder**), đa ngôn ngữ (`VI` / `EN` / `ZH`), quản lý khách hàng tiềm năng (**Leads CRM / Google Sheets / Email / Bitrix24**) và cơ sở dữ liệu **PostgreSQL / Supabase Self-Host**.

---

## 1. Danh sách 14 Landing Page tích hợp sẵn

Hệ thống bao gồm **14 trang Landing Page** được chuẩn hóa từ hai nguồn hạ tầng gốc (**Host Mắt Bão** và **LadiPage**):

| STT | Mã trang (`site_code`) | Tên trang / Giải pháp | Nguồn gốc | Ngôn ngữ hỗ trợ | Cổng chạy độc lập |
| :-: | :--- | :--- | :---: | :---: | :---: |
| 1 | `cms-intellicad` | Giải pháp CAD bản quyền vĩnh viễn CMS IntelliCAD | Host Mắt Bão | `VI`, `EN` | `3005` |
| 2 | `robot-cong-trinh` | Robot Xây dựng & Khảo sát Hạ tầng Công trình | Host Mắt Bão | `VI` | `3006` |
| 3 | `allplan` | Giải pháp BIM Cầu Hầm & Kết cấu Allplan | LadiPage | `VI` | `3007` |
| 4 | `bim` | Giải pháp Tư vấn & Đào tạo BIM | LadiPage | `VI`, `EN` | `3008` |
| 5 | `enjicad` | Phần mềm CAD 2D/3D EnjiCAD | LadiPage | `VI`, `EN`, `ZH` | `3009` |
| 6 | `escon` | Phần mềm Dự toán Công trình Escon | Host Mắt Bão | `VI` | `3010` |
| 7 | `revit` | Phần mềm Autodesk Revit BIM | Host Mắt Bão | `VI` | `3011` |
| 8 | `autocad` | Phần mềm Thiết kế Kỹ thuật AutoCAD | Host Mắt Bão | `VI` | `3012` |
| 9 | `cubicost` | Giải pháp BIM Bóc tách Khối lượng Glodon Cubicost | LadiPage | `VI` | `3013` |
| 10 | `enjicadpro` | Giải pháp EnjiCAD Pro | LadiPage | `VI` | `3014` |
| 11 | `piletest` | Thiết bị Kiểm tra Cọc & Nền móng Piletest | LadiPage | `VI` | `3015` |
| 12 | `foxit` | Giải pháp Tài liệu Điện tử Foxit PDF Editor | LadiPage | `VI` | `3016` |
| 13 | `maydocapngam` | Thiết bị Dò tìm Cáp ngầm & Đường ống | LadiPage | `VI` | `3017` |
| 14 | `cabinetvision` | Giải pháp Thiết kế & Sản xuất Nội thất Cabinet Vision | LadiPage | `VI` | `3018` |

---

## 2. Tính năng nổi bật

- **Visual CMS Builder (`?tab=edit`)**:
  - Click sửa trực tiếp mọi tiêu đề, đoạn văn, nhãn form, nút bấm, bảng giá ngay trên giao diện trang đích mà vẫn **giữ nguyên 100% định dạng font gốc** (`font-family`, `font-weight`, `font-size`, màu sắc).
  - Di chuột nhận diện và thay thế mọi hình ảnh sản phẩm, icon, cũng như ảnh nền section (`🖼 Thay ảnh`) thông qua **Thư viện Media Supabase** (lưu trữ đồng thời vào PostgreSQL `bytea` và ổ đĩa).
  - Hỗ trợ quy trình **Lưu nháp (Save Draft)** -> **Xem trước (Preview)** -> **Xuất bản (Publish)** và khôi phục lịch sử phiên bản (**Revisions**).
- **Quản lý Form & Luồng sau đăng ký (Conditional Form & Post-Submit Workflow)**:
  - Tùy chỉnh trường dữ liệu Form đăng ký, cấu hình hành động sau khi khách hàng gửi Form (chỉ hiện thông báo cảm ơn hoặc bật Popup tải tài liệu PDF / bộ cài dùng thử / bộ Lisp).
  - Quản lý danh sách khách hàng đăng ký (**Leads**), xuất báo cáo Excel (`.xlsx`), gửi thông báo Email và đồng bộ Google Sheets / Bitrix24 CRM.
- **Xuất gói Triển khai Độc lập (1-Click Standalone Package Exporter)**:
  - Xuất bất kỳ trang nào thành một gói độc lập hoàn chỉnh (`.zip` hoặc thư mục `dist-deploy/<site_code>`) kèm sẵn `docker-compose.yml`, dữ liệu `seed`, tập tin media của riêng trang đó để bàn giao hoặc deploy lên VPS/Server riêng.
  - Trang đăng nhập Admin của gói độc lập hoàn toàn sạch (không hiển thị gợi ý tài khoản nhanh như trên trang tổng Master Hub) và cô lập cookie phiên đăng nhập theo từng trang.

---

## 3. Yêu cầu hệ thống

- **Node.js**: `>= 20.x` (khuyên dùng `Node.js 22 LTS` hoặc `24`)
- **PostgreSQL / Supabase Self-Host**:
  - Có thể dùng **Docker Desktop** để chạy container PostgreSQL + Supabase Studio tích hợp sẵn trong `infra/supabase/docker-compose.yml`, **hoặc** kết nối tới bất kỳ máy chủ PostgreSQL / Supabase Self-Host nào có sẵn của bạn.

---

## 4. Hướng dẫn Cài đặt & Chạy hệ thống (Zero-Config — Không cần tạo `.env` hay TK/MK Supabase)

Mã nguồn của dự án (`@cic/db` và `seed/auto-seed.mjs`) **đã tích hợp sẵn cấu hình kết nối mặc định** tới Supabase Self-Host (`127.0.0.1:54322`), và giao diện **Supabase Studio Self-Host (`http://localhost:54323`) mở trực tiếp không cần tài khoản/mật khẩu đăng nhập**.

### Bước 1: Clone dự án và cài đặt thư viện

```bash
git clone https://github.com/namphan2k3/cic-ldp.git
cd cic-ldp
npm install
```

### Bước 2: Khởi chạy Supabase Self-Host (Nếu máy chưa bật sẵn) & Nạp dữ liệu gốc

1. **Nếu máy bạn đã có sẵn Supabase Self-Host đang chạy (cổng `54322`)**: Bỏ qua bước bật Docker, chạy thẳng lệnh nạp dữ liệu ở mục 2 bên dưới.
2. **Nếu máy mới hoàn toàn**: Bật nhanh cụm PostgreSQL + Supabase Studio Self-Host tích hợp sẵn (không cần tạo file `.env` hay cài đặt tài khoản gì thêm):
   ```bash
   docker compose -f infra/supabase/docker-compose.yml up -d
   ```
   - **Supabase Studio (Xem & sửa bảng trực tiếp, không cần login)**: `http://localhost:54323`
   - **PostgreSQL Port**: `127.0.0.1:54322`

3. **Nạp cấu trúc bảng & dữ liệu gốc của 14 trang (`db:seed`)**:
   ```bash
   npm run db:seed
   ```

### Bước 3: Chạy Master Hub (Trang Tổng quản lý cả 14 trang)

- **Chế độ Development**:
  ```bash
  npm run dev:landing
  ```
- **Chế độ Production (Nhanh & Tối ưu)**:
  ```bash
  npm run build:landing
  npx --workspace @cic/landing-hub next start -p 3004
  ```

Sau khi chạy, truy cập:
- **Trang Tổng (Master Hub Directory)**: `http://localhost:3004`
- **Trang Quản trị Nội dung Web CMS**: `http://localhost:3004/admin`
- **Xem từng trang đích**: `http://localhost:3004/s/<site_code>` (ví dụ: `http://localhost:3004/s/robot-cong-trinh`, `http://localhost:3004/s/cms-intellicad`, `http://localhost:3004/s/allplan`)

---

## 5. Tài khoản Đăng nhập Trang Quản trị Web CMS (`http://localhost:3004/admin/login`)

> **Lưu ý**:
> - **Supabase Studio Self-Host (`http://localhost:54323`)** **KHÔNG** có màn hình đăng nhập (truy cập thẳng vào quản lý Database).
> - Các tài khoản dưới đây là tài khoản dùng để đăng nhập vào **Trang Quản trị Web CMS của hệ thống Landing Page (`/admin/login`)** để sửa chữ, thay ảnh, xem danh sách khách hàng đăng ký:

| Vai trò | Tài khoản (`username`) | Mật khẩu (`password`) | Phạm vi quyền |
| :--- | :--- | :--- | :--- |
| **Super Admin (Toàn quyền)** | `superadmin` | `CicAdmin@2026` | Quản trị tất cả 14 trang |
| **Admin trang CMS IntelliCAD** | `cad_admin` | `cad@2026` | Chỉ quản trị `cms-intellicad` |
| **Admin trang Robot Công trình** | `robot_admin` | `robot@2026` | Chỉ quản trị `robot-cong-trinh` |
| **Admin từng trang khác** | `<site_code>_admin` *(VD: `allplan_admin`)* | `CicAdmin@2026` *(hoặc `<site_code>@2026`)* | Chỉ quản trị trang tương ứng |

---

## 6. Hướng dẫn Xuất & Chạy Gói Độc lập (Standalone Package)

Bạn có thể xuất bất kỳ trang nào thành một gói độc lập để chạy riêng trên 1 domain/port hoặc bàn giao cho đơn vị vận hành:

### Cách 1: Xuất trực tiếp trên giao diện Web Admin
1. Đăng nhập vào `http://localhost:3004/admin/<site_code>?tab=revisions` (Tab **Lịch sử & Xuất gói Deploy**).
2. Bấm **"Tải gói Độc lập (.ZIP)"** hoặc **"Xuất ra thư mục `dist-deploy/<site_code>`"**.

### Cách 2: Chạy gói độc lập sau khi giải nén
Bên trong gói độc lập đã có sẵn `seed/schema.sql`, `seed/seed-data.json` (chỉ chứa dữ liệu của riêng trang đó), và tập tin `.env`:

```bash
cd dist-deploy/<site_code>
npm install
node seed/auto-seed.mjs
npm run build
npm run start
```
*(Trên máy Windows, bạn cũng có thể bấm đúp vào `START-WINDOWS.bat` đi kèm trong gói để tự động kiểm tra DB, nạp seed và khởi chạy server).*

---

## 7. Cấu trúc thư mục dự án

```text
cic-ldp/
├── apps/
│   ├── landing-hub/          # Ứng dụng Next.js chính (Master Hub + 14 Templates + Visual CMS Admin)
│   │   ├── public/sites/     # Tài nguyên tĩnh (CSS/JS/Images/Fonts) của các trang LadiPage & Mắt Bão
│   │   │   └── landing-cms-workflow-bridge.js  # Runtime bridge xử lý Visual Editor, Form & Override
│   │   └── src/
│   │       ├── app/          # Next.js App Router (/, /s/[code], /admin/[siteCode], /api/landing/*)
│   │       ├── templates/    # Bộ giao diện độc lập của từng trang trong 14 trang
│   │       └── lib/          # Xác thực Admin, Xuất gói Deploy, Đồng bộ Google Sheets & Email
│   ├── data-hub/             # Ứng dụng quản trị dữ liệu nội bộ
│   └── sync-worker/          # Worker đồng bộ dữ liệu nền & sao lưu
├── packages/
│   ├── db/                   # Tầng truy vấn PostgreSQL (@cic/db)
│   ├── sheets/               # Tích hợp Google Sheets API (@cic/sheets)
│   └── shared/               # Kiểu dữ liệu & tiện ích dùng chung (@cic/shared)
├── infra/
│   └── supabase/             # Cấu hình Docker Compose cho PostgreSQL & Supabase Studio Self-Host
└── seed/
    ├── schema.sql            # Cấu trúc bảng cic_landing.* và các View public.*
    ├── seed-data.json        # Dữ liệu khởi tạo chuẩn của 14 trang Landing Page
    └── auto-seed.mjs         # Kịch bản nạp dữ liệu tự động (Idempotent Auto-Seeder)
```
