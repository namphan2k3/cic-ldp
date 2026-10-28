'use client';

import React from 'react';
import Link from 'next/link';

interface CmsUserGuideViewProps {
  siteCode: string;
  locale: string;
}

export function CmsUserGuideView({ siteCode, locale }: CmsUserGuideViewProps) {
  const steps = [
    {
      num: 'Bước 1',
      title: 'Chọn mục (Section) và ngôn ngữ cần chỉnh sửa',
      desc: 'Ở thanh menu dọc bên trái, chọn mục cần sửa (Header, Hero, Giới thiệu, Sản phẩm, Video, FAQ, Footer...). Chọn ngôn ngữ VI hoặc EN ở góc phải trên cùng.',
      tips: [
        'Mỗi khi chuyển mục, nếu có thay đổi chưa lưu, hệ thống sẽ tự động lưu bản nháp để không mất dữ liệu.',
        'Bạn có thể chuyển đổi khung nhìn Mobile (430px), Tablet (768px) và PC để kiểm tra bố cục thực tế.',
      ],
    },
    {
      num: 'Bước 2',
      title: 'Click trực tiếp vào chữ trên giao diện để sửa nội dung',
      desc: 'Trong khung xem trước trực tiếp (Live Preview), hãy nhấp chuột vào bất kỳ tiêu đề, đoạn văn, nhãn nút bấm hoặc câu hỏi nào để gõ nội dung mới ngay tại chỗ.',
      tips: [
        'Sử dụng thanh công cụ phía trên để in đậm (B), in nghiêng (I), gạch chân (U), căn lề hoặc đổi cỡ chữ.',
        'Nếu muốn thêm/xóa mục trong danh sách (như thêm sản phẩm, thêm câu hỏi FAQ, thêm thông số), bấm nút "Mở biểu mẫu dữ liệu" trên thanh công cụ.',
      ],
    },
    {
      num: 'Bước 3',
      title: 'Thay ảnh trực tiếp từ Kho Media Supabase',
      desc: 'Di chuột lên bất kỳ hình ảnh hoặc logo nào trên giao diện xem trước, nút "Thay ảnh" sẽ xuất hiện ở góc phải ảnh.',
      tips: [
        'Bấm "Thay ảnh" để mở Kho ảnh Supabase của trang hoặc tải ảnh mới từ máy tính lên.',
        'Ảnh sau khi chọn sẽ được áp dụng ngay lập tức vào vị trí đó mà không cần chỉnh sửa mã code.',
      ],
    },
    {
      num: 'Bước 4',
      title: 'Chỉnh sửa Số điện thoại, Zalo, Email, SEO và Video YouTube',
      desc: 'Ở các mục có thông tin liên hệ (Header, Form tư vấn, Footer, Nút nổi), thanh "Mục liên hệ & Link nhanh" sẽ hiển thị ngay phía trên khung xem trước.',
      tips: [
        'Bấm vào nút SĐT / Zalo / Email tương ứng, nhập số mới và bấm "Áp dụng link".',
        'Tại mục Header, bạn có thể sửa Tiêu đề & Mô tả SEO kèm khung xem trước kết quả tìm kiếm Google.',
        'Tại mục Video, chỉ cần dán link YouTube bất kỳ, hệ thống sẽ tự động trích xuất mã nhúng chuẩn 16:9.',
      ],
    },
    {
      num: 'Bước 5',
      title: 'Lưu bản nháp, Xem trước toàn trang và Xuất bản',
      desc: 'Sau khi chỉnh sửa xong, bấm "Lưu bản nháp". Khi đã kiểm tra kỹ trên khung xem trước, bấm nút màu xanh lá "Xuất bản" để cập nhật lên website chính thức.',
      tips: [
        'Mọi lần xuất bản đều được ghi lại trong tab "Lịch sử". Bạn có thể khôi phục (Rollback) về bất kỳ phiên bản cũ nào chỉ với 1 cú nhấp chuột.',
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-white p-6 shadow-xs">
        <div>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-black tracking-wider text-blue-800 uppercase">
            Tài liệu hướng dẫn CMS
          </span>
          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Hướng dẫn quản trị nội dung trực quan (0% Code)
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Quy trình 5 bước giúp biên tập viên cập nhật nội dung, hình ảnh, SEO và liên hệ
            nhanh chóng, an toàn.
          </p>
        </div>

        <Link
          href={`/admin/${siteCode}?lang=${locale}&tab=edit`}
          className="whitespace-nowrap rounded-xl bg-[#0b1b36] px-5 py-3 text-xs font-bold text-white shadow-2xs transition hover:bg-slate-800"
        >
          Quay lại Chỉnh sửa Giao diện
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ${
              idx === steps.length - 1 ? 'md:col-span-2' : ''
            }`}
          >
            <div className="inline-flex items-center rounded-lg bg-blue-900 px-2.5 py-1 text-xs font-black text-white">
              {s.num}
            </div>
            <h2 className="mt-3 text-base font-black text-slate-900">{s.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{s.desc}</p>
            <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-700">
              {s.tips.map((tip, tIdx) => (
                <li key={tIdx} className="flex items-start gap-2">
                  <span className="font-black text-blue-700">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
