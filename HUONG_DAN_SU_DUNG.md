# HƯỚNG DẪN VẬN HÀNH & QUẢN TRỊ HỆ THỐNG LANDING PAGE CIC

Hệ thống quản trị nội dung (**Visual CMS**), thống kê lượt xem và đồng bộ khách hàng (**Google Sheets / PostgreSQL**) cho **14 trang sản phẩm/giải pháp của CIC**.

---

## 1. Hai phương án triển khai lên Host

Hệ thống hỗ trợ linh hoạt **2 cách đưa lên Host** tùy nhu cầu hạ tầng:

1. **Cách 1 — Chạy chung 1 Source Code cho cả 14 trang (Multi-Domain)**:
   - Chỉ cần cài đặt **1 bộ source code duy nhất** lên Server/VPS và trỏ cả 14 tên miền về cùng Server đó.
   - Hệ thống tự động nhận diện tên miền khách truy cập để hiển thị đúng giao diện trang chủ (`/`) và khóa đúng trang quản trị riêng (`/admin`) của tên miền đó.
2. **Cách 2 — Xuất Gói Độc lập cho từng trang (Standalone Package)**:
   - Trong trang Quản trị, bấm nút **"Xuất gói Deploy"** để tách bất kỳ trang nào ra thư mục riêng (`deploy-<mã-trang>`).
   - Mỗi gói độc lập chỉ chứa đúng dữ liệu, hình ảnh và cấu hình của 1 trang duy nhất để đẩy lên Host/VPS riêng biệt.

---

## 2. Tổng quan 14 Tên miền, Nguồn gốc Host & Tài khoản Quản trị

### 2.1. Tài khoản Quản trị Tổng (Toàn quyền 14 trang)

| Phạm vi | Tên đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị Tổng (Super Admin)** | `admin` *(hoặc `superadmin`)* | `cic@2026` *(hoặc `CicAdmin@2026`)* | Xem thống kê tổng hợp, quản lý khách hàng và chuyển qua lại chỉnh sửa cả 14 trang không cần đăng nhập lại |

### 2.2. Danh sách 14 Website, Tên miền, Hạ tầng gốc & Tài khoản riêng từng trang

Mỗi tài khoản riêng bên dưới **chỉ có quyền truy cập và chỉnh sửa đúng 1 website được phân công**:

| # | Mã trang (`site_code`) | Tên giải pháp / Sản phẩm | Tên miền chính (`primary_domain`) | Hạ tầng gốc | Ngôn ngữ | Tài khoản riêng | Mật khẩu | Cổng Độc lập (Local) |
| :-: | :--- | :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| 1 | `cms-intellicad` | CMS IntelliCAD | `cmsintellicad.vn` | **Host Mắt Bão** | `VI`, `EN` | `cad_admin` | `cad@2026` | `:3005` |
| 2 | `robot-cong-trinh` | Robot Xây dựng & Hạ tầng | `robotcongtrinh.vn` | **Host Mắt Bão** | `VI` | `robot_admin` | `robot@2026` | `:3006` |
| 3 | `allplan` | Giải pháp BIM Allplan | `allplan.cic.com.vn` | **LadiPage** | `VI` | `allplan_admin` | `allplan@2026` | `:3007` |
| 4 | `bim` | Tư vấn & Đào tạo BIM | `bim.cic.com.vn` | **LadiPage** | `VI`, `EN` | `bim_admin` | `bim@2026` | `:3008` |
| 5 | `enjicad` | Phần mềm CAD EnjiCAD | `enjicad.vn` | **LadiPage** | `VI`, `EN`, `ZH` | `enjicad_admin` | `enjicad@2026` | `:3009` |
| 6 | `escon` | Dự toán Công trình Escon | `escon.cic.com.vn` | **Host Mắt Bão** | `VI` | `escon_admin` | `escon@2026` | `:3010` |
| 7 | `revit` | Autodesk Revit BIM | `revit.cic.com.vn` | **Host Mắt Bão** | `VI` | `revit_admin` | `revit@2026` | `:3011` |
| 8 | `autocad` | Thiết kế Kỹ thuật AutoCAD | `autocad.cic.com.vn` | **Host Mắt Bão** | `VI` | `autocad_admin` | `autocad@2026` | `:3012` |
| 9 | `cubicost` | BIM Glodon Cubicost | `cubicost.cic.com.vn` | **LadiPage** | `VI` | `cubicost_admin` | `cubicost@2026` | `:3013` |
| 10 | `enjicadpro` | Giải pháp EnjiCAD Pro | `enjicadpro.cic.com.vn` | **LadiPage** | `VI` | `enjicadpro_admin` | `enjicadpro@2026` | `:3014` |
| 11 | `piletest` | Thiết bị Kiểm tra Cọc Piletest | `piletest.cic.com.vn` | **LadiPage** | `VI` | `piletest_admin` | `piletest@2026` | `:3015` |
| 12 | `foxit` | Giải pháp Foxit PDF Editor | `foxit.cic.com.vn` | **LadiPage** | `VI` | `foxit_admin` | `foxit@2026` | `:3016` |
| 13 | `maydocapngam` | Thiết bị Dò tìm Cáp ngầm | `maydocapngam.cic.com.vn` | **LadiPage** | `VI` | `maydocapngam_admin` | `maydocapngam@2026` | `:3017` |
| 14 | `cabinetvision` | Nội thất Cabinet Vision | `cabinetvision.nghenoithat.vn` | **LadiPage** | `VI` | `cabinetvision_admin` | `cabinetvision@2026` | `:3018` |

> **Bảo mật khi đưa lên Host thật**: Bảng tra cứu tài khoản trên trang chủ chỉ hiển thị khi chạy ở `localhost` để tiện kiểm thử; khi truy cập qua tên miền thật hoặc IP public, bảng tài khoản tự động ẩn hoàn toàn.

---

## 3. Cách truy cập Trang Quản trị (`/admin`)

- **Trên tên miền riêng của từng trang (cả bản chạy chung lẫn gói độc lập)**:
  - Truy cập trực tiếp **`https://<tên-miền>/admin`** (ví dụ: `https://robotcongtrinh.vn/admin`, `https://allplan.cic.com.vn/admin`).
  - Hệ thống tự nhận diện tên miền và khóa phiên đăng nhập đúng vào trang đó.
- **Trên máy Local (`localhost:3004`) hoặc IP chung**:
  - Quản trị Tổng: `http://localhost:3004/admin`
  - Quản trị từng trang: `http://localhost:3004/admin/<mã-trang>` (ví dụ: `http://localhost:3004/admin/allplan`)
  - Hoặc vào `/admin/login` và đăng nhập bằng tài khoản riêng của trang (ví dụ `allplan_admin`), hệ thống sẽ tự chuyển vào `/admin/allplan`.

---

## 4. Thao tác Quản trị nhanh

1. **Chỉnh sửa Giao diện trực quan (Tab `Chỉnh sửa Giao diện`)**:
   - **Sửa chữ**: Bấm trực tiếp vào tiêu đề, đoạn văn, nút bấm trên khung trang đích để gõ nội dung mới (giữ nguyên 100% phông chữ và cỡ chữ gốc).
   - **Thay ảnh**: Bấm nút **`🖼 Thay ảnh`** trên ảnh bất kỳ $\rightarrow$ chọn ảnh có sẵn hoặc tải ảnh mới từ máy tính lên.
   - **Lưu & Xuất bản**: Bấm **Lưu nháp** để xem thử hoặc **Xuất bản** để áp dụng ngay lên trang chính thức. Có thể hoàn tác về các bản cũ tại tab **Lịch sử Phiên bản**.
2. **Khách hàng đăng ký & Google Sheets (Tab `Khách hàng đăng ký`)**:
   - Tự động lưu khách hàng điền form vào PostgreSQL và đồng bộ 2 chiều với Google Sheets (nút **"Đồng bộ từ Google Sheets"** hoặc **"Xuất Excel .CSV"**).
3. **Thống kê Lượt xem & SEO (Tab `Tổng quan & Lưu lượng` / `Cấu hình SEO`)**:
   - Tự động đếm lượt xem trang (**Pageviews**) và khách truy cập duy nhất (**Unique Visitors**) theo ngày trên toàn bộ 14 trang, đồng thời tích hợp sẵn mã GA4 / GTM và thẻ chuẩn SEO (`title`, `description`, `keywords`, `OpenGraph`, `sitemap.xml`, `robots.txt`).
4. **Đổi mật khẩu hoặc tạo tài khoản mới**:
   - Tại Quản trị Tổng (`/admin?tab=sites`), bấm **"Cấu hình SEO & Tracking"** ở trang bất kỳ để đổi tên miền, mã GA4/GTM hoặc đặt lại tài khoản/mật khẩu riêng cho trang đó.
