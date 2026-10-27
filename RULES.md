# CIC Landing Platform — Quy Chuẩn Kỹ Thuật & Kiến Trúc (Architecture & Coding Standards)

Tài liệu này là **bộ quy chuẩn bắt buộc** cho toàn bộ quá trình phát triển, tái cấu trúc và vận hành hệ thống Landing Page trên nền tảng React 19 / Next.js 16 và PostgreSQL `cic_landing`.

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

1. **Cam kết 100% Visual & Functional Parity (Không suy hao giao diện & tính năng):**
   - Mọi trang chuyển đổi từ Laravel Blade sang React 19 phải giữ nguyên 100% cấu trúc HTML ngữ nghĩa, CSS styling, responsive breakpoints (Desktop, Tablet, Mobile), icon SVG, animations (Ken Burns, smooth scroll, transitions) và tương tác người dùng (video slider, PDF modal, tab FAQ, form validation & modal tải file).
2. **Single Schema of Truth (`cic_landing`):**
   - Mọi dữ liệu về site, trang con, section, style, media, form và lead phải nằm trong schema `cic_landing`. Tuyệt đối không hardcode text/nội dung tĩnh trong code React Component.
3. **Cấu Trúc Hóa & Module Hóa (NO Mega-Components):**
   - Tuyệt đối không viết component "khổng lồ" 500-1000 dòng. Mỗi section được phân rã thành các file component con nhỏ gọn (< 200 dòng), đơn trách nhiệm (Single Responsibility).
   - Tách biệt rõ ràng: **Container/Server Component** (nạp dữ liệu) $\rightarrow$ **Custom Hook** (quản lý state/tương tác) $\rightarrow$ **Presentational/Leaf Components** (render DOM & CSS).

---

## 2. Quy Chuẩn Đặt Tên Database (Database Naming Standards)

1. **Schema:** Luôn dùng `cic_landing`. Không tạo bảng trong `public`.
2. **Tên bảng:** Phải có tiền tố `landing_` (`landing_sites`, `landing_pages`, `landing_section_types`, `landing_page_sections`, `landing_media_assets`, `landing_forms`, `landing_lead_submissions`, `landing_lead_deliveries`, `landing_content_revisions`).
3. **Tên cột:**
   - Khóa chính luôn có tiền tố thực thể: `landing_site_id`, `landing_page_id`, `landing_section_id`, `landing_form_id`, `landing_lead_id`... (Không dùng `id`).
   - Khóa ngoại mang tên chính xác của khóa chính mà nó tham chiếu.
   - Cột thời gian có hậu tố `_utc` và dùng kiểu `TIMESTAMPTZ` (vd: `created_at_utc`, `submitted_at_utc`).
   - Cột JSON lưu cấu hình/dữ liệu linh hoạt có hậu tố `_json` (vd: `fields_schema_json`, `submitted_fields_json`, `tracking_context_json`).
   - Cột cờ logic có tiền tố `is_` hoặc `has_` (vd: `is_section_enabled`, `has_unpublished_draft`).

---

## 3. Cấu Trúc Thư Mục React Components (Modular Directory Structure)

```
cic-platform/apps/landing-hub/src/
├── app/
│   ├── _sites/
│   │   └── [code]/
│   │       ├── page.tsx               # Next.js Server Component (Host / Site Code resolver)
│   │       └── layout.tsx
│   ├── admin/
│   │   ├── actions.ts                 # Server Actions cho Demo Management
│   │   ├── page.tsx                   # Page thứ 3: Demo Management Portal
│   │   └── components/                # Sub-components của Admin (PageBuilder, Media, Leads, Revisions)
│   ├── api/
│   │   └── landing/
│   │       └── leads/
│   │           └── route.ts           # Dynamic Lead Capture & Delivery API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                       # Hub Launcher (Menu 3 trang)
│
├── templates/                         # Thư viện React Templates theo từng giao diện gốc
│   ├── registry.ts                    # Template dispatcher theo theme_template_code
│   ├── common/                        # Component dùng chung cho các landing page
│   │   ├── DynamicLeadForm.tsx        # Dynamic form renderer từ fields_schema_json
│   │   ├── MediaImage.tsx             # Smart image renderer
│   │   ├── RichText.tsx               # An toàn XSS & chuẩn format rich text
│   │   └── SeoHead.tsx                # Dynamic meta tags & tracking scripts
│   │
│   ├── cms-intellicad/                # 100% Parity với cmsintellicad.vn
│   │   ├── components/
│   │   │   ├── Header.tsx             # Sticky header + compact scroll + language switcher
│   │   │   ├── HeroSection.tsx        # Hero headline + pricing box
│   │   │   ├── LicenseCards.tsx       # 3 thẻ PE, PE Plus, Easy Run
│   │   │   ├── AdvantagesSection.tsx  # 6 thẻ ưu điểm
│   │   │   ├── ComparisonSection.tsx  # So sánh AutoCAD + bảng ma trận
│   │   │   ├── ComparisonPdfModal.tsx # Modal xem trước PDF 3 trang
│   │   │   ├── RequirementsSection.tsx# Bảng cấu hình hệ thống
│   │   │   ├── ResourcesSection.tsx   # Thư viện & link tải
│   │   │   ├── FaqSection.tsx         # Search trực tiếp + Category tabs + Accordion
│   │   │   ├── ConsultationFormSection.tsx # Form đăng ký + conditional receive_lisp
│   │   │   ├── TrialDownloadModal.tsx # Modal tải Trial 30 ngày / LISP .rar sau khi gửi
│   │   │   ├── Footer.tsx             # Footer thông tin TechAZ / CIC
│   │   │   └── FloatingCta.tsx        # Thanh CTA nổi sau khi cuộn > 250px
│   │   ├── hooks/
│   │   │   ├── useCmsIntellicadScroll.ts
│   │   │   └── useFaqFilter.ts
│   │   └── CmsIntellicadTemplate.tsx   # Template orchestrator ghép các component con
│   │
│   └── robot-cong-trinh/              # 100% Parity với robotcongtrinh.vn
│       ├── components/
│       │   ├── Header.tsx             # Header sticky compact + mobile drawer
│       │   ├── HeroKenBurns.tsx       # Hero full-screen + Ken Burns animation
│       │   ├── IntroStory.tsx         # Giới thiệu 2 cột + tag nổi bật
│       │   ├── RobotCatalog.tsx       # 4 nhóm robot xây dựng + ảnh duo
│       │   ├── VideoSlider.tsx        # Slider 4 video YouTube công trường
│       │   ├── ProfileDownloadBtn.tsx # Nút tải Profile PDF
│       │   ├── InfrastructureRobots.tsx# 2 nhóm robot hạ tầng + YouTube switchers
│       │   ├── ConsultSection.tsx     # Form tư vấn trên nền ảnh công trường
│       │   ├── FaqAccordion.tsx       # Accordion câu hỏi thường gặp
│       │   └── Footer.tsx             # Footer thông tin liên hệ CIC
│       ├── hooks/
│       │   ├── useRobotHeaderScroll.ts
│       │   └── useVideoSlider.ts
│       └── RobotCongTrinhTemplate.tsx # Template orchestrator ghép các component con
```

---

## 4. Quy Chuẩn Xử Lý Form & Đồng Bộ Dữ Liệu (Form & Lead Guidelines)

1. **Nguyên tắc "PostgreSQL First":**
   - Dữ liệu điền form PHẢI được ghi thành công vào `cic_landing.landing_lead_submissions` trước tiên.
   - Nếu kết nối Google Sheet / Webhook lỗi, form vẫn trả về thành công cho khách hàng kèm tài liệu tải về, ghi nhận `sheet_sync_status = 'failed'` để worker tự động thử lại sau.
2. **Dynamic Validation:**
   - Backend validate dữ liệu dựa trên `fields_schema_json` của Form đó trong DB, không hardcode danh sách trường trong route handler.
3. **Chống Spam & Deduplication:**
   - Tạo `dedup_fingerprint` (kết hợp IP + Email + Phone). Nếu gửi lại cùng thông tin trong vòng 20 giây thì trả về kết quả thành công ngay mà không tạo bản ghi rác.
4. **Conditional Logic:**
   - Hỗ trợ các trường rẽ nhánh (vd: chọn `receive_lisp` thì ẩn ô phiên bản & số lượng máy; đẩy vào tab `CMS INTELLICAD LISP` thay vì `LADIPAGE`).

---

## 5. Quy Chuẩn Kiểm Thử & Nghiệm Thu (Verification Standards)

1. **Schema Check:** Chạy script kiểm tra 9 bảng, các cột bắt buộc, kiểu dữ liệu và index.
2. **Visual Parity:** Kiểm tra song song từng section giữa web cũ và React mới trên cả 3 độ phân giải (Mobile 390px, Tablet 768px, Desktop 1440px).
3. **Behavioral Parity:**
   - Test đóng/mở modal PDF, tab lọc FAQ, slider video YouTube.
   - Test gửi form thật cho cả 2 site, kiểm tra dữ liệu vào PostgreSQL và hiển thị trên Google Sheet.
   - Test luồng tải file Trial 30 ngày và LISP `.rar`.
   - Test sửa nội dung section trên trang quản trị Demo (`/admin`), xem trước (`?preview=1`), xuất bản và rollback.
