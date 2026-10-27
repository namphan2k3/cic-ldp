# Hướng dẫn Kết nối & Đồng bộ Google Sheet Mới (Trường Động Linh Hoạt)

Hệ thống **CIC Data Hub** được thiết kế để kết nối bất kỳ file Google Sheet nào dù **mỗi Sheet có cấu trúc cột hoàn toàn khác nhau**. Không cần sửa code hay tạo bảng database mới khi thêm Sheet.

---

## 1. Chia sẻ quyền truy cập trên Google Sheet

Mở file Google Sheet cần đồng bộ, bấm nút **Chia sẻ (Share)** ở góc phải trên và cấp quyền **Người xem (Viewer)** (nếu chỉ kéo dữ liệu `pull` về DB) hoặc **Người chỉnh sửa (Editor)** (nếu muốn đẩy lượt đăng ký form từ Landing Page lên Sheet) cho 1 trong 2 tài khoản dịch vụ sau:

- `cms-intellicad-form@n8n-docs-automation-485708.iam.gserviceaccount.com`
- `sheet-bot@ggsheet-form.iam.gserviceaccount.com`

---

## 2. Thêm Sheet trên Giao diện CIC Data Hub (`/sheets`)

1. Truy cập `http://localhost:4302/sheets` (hoặc `https://data.cic.com.vn/sheets`).
2. Dán đường dẫn URL của Google Sheet vào ô **URL Google Sheet hoặc Spreadsheet ID**.
3. Chọn dòng tiêu đề (mặc định dòng `1`) và bấm **"1. Kiểm tra & Tự phát hiện cột động"**.
4. Hệ thống sẽ tự động:
   - Liệt kê tất cả các **Tab (Sheet)** có trong file.
   - Chuẩn hóa tiêu đề tiếng Việt có dấu thành khóa ổn định (`Số điện thoại` &rarr; `so_dien_thoai`, `Họ và tên` &rarr; `ho_va_ten`).
   - Tự nhận diện kiểu dữ liệu (`phone`, `email`, `datetime`, `number`, `url`, `text`) và tự động giữ số `0` ở đầu số điện thoại.
   - Hiển thị 5 dòng dữ liệu mẫu để kiểm tra trực quan.
5. (Tùy chọn) Bấm chọn 1–2 cột làm **Khóa định danh dòng (`key_columns`)** (ví dụ: `so_dien_thoai` + `thoi_gian`). Nếu không chọn, hệ thống tự động dùng mã băm `SHA-256` toàn bộ nội dung dòng.
6. Bấm **"2. Lưu & Đồng bộ"** — dữ liệu toàn bộ Sheet sẽ được kéo về bảng `cic_sheet_rows` ngay lập tức!

---

## 3. Cài đặt Đồng bộ Tức thì khi sửa trên Google Sheet (Apps Script Webhook)

Ngoài việc `sync-worker` tự động kiểm tra định kỳ mỗi 5 phút, anh có thể gắn đoạn mã ngắn sau vào **Tiện ích mở rộng (Extensions) &rarr; Apps Script** trên file Google Sheet để mỗi khi có người sửa/thêm dòng trên Sheet thì Data Hub cập nhật ngay lập tức:

```javascript
function onEdit(e) {
  var webhookUrl = "https://data.cic.com.vn/api/webhooks/sheets/<MA_NGUON_SHEET>?secret=<WEBHOOK_SECRET>";
  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: "post",
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log(err);
  }
}
```
*(Đường dẫn `webhookUrl` kèm `secret` đã được sinh sẵn tại từng thẻ nguồn Sheet trong màn hình `/sheets`).*
