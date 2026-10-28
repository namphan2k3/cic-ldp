import React from 'react';
import { CmsIcon } from './CmsIcon';

interface RequirementsSectionProps {
  payload: Record<string, unknown>;
  locale: string;
}

export function RequirementsSection({ payload, locale }: RequirementsSectionProps) {
  const req = payload as Record<string, any>;
  const headers = req.headers || {
    component: 'Thành phần',
    minimum: 'Yêu cầu tối thiểu',
    old: 'Cấu hình cơ bản',
    system: 'Khuyến nghị đề xuất',
    new: 'Hiệu năng cao nhất',
  };
  const specs = req.specs || [
    { title: 'Hệ điều hành (OS)', icon: 'laptop', old: 'Windows 8.1 / 10 64-bit', new: 'Windows 10 / 11 64-bit (Update mới nhất)' },
    { title: 'Bộ vi xử lý (CPU)', icon: 'cpu', old: 'Intel Core i3 / AMD Ryzen 3 trở lên', new: 'Intel Core i5 / i7 / Ryzen 5 / 7 (3.0 GHz+ đa nhân)' },
    { title: 'Bộ nhớ (RAM)', icon: 'hard-drive', old: 'Tối thiểu 4 GB RAM', new: 'Khuyến nghị 8 GB - 16 GB RAM trở lên' },
    { title: 'Dung lượng ổ cứng', icon: 'hard-drive', old: 'Trống tối thiểu 4 GB (HDD/SSD)', new: 'Ổ cứng SSD NVMe tốc độ cao trống từ 10 GB' },
    { title: 'Card đồ họa (GPU)', icon: 'monitor', old: '1 GB VRAM, OpenGL 3.0', new: '2 GB - 4 GB VRAM chuyên dụng, DirectX 11/12' },
    { title: 'Màn hình & Độ phân giải', icon: 'monitor', old: '1366 x 768 True Color', new: '1920 x 1080 (FHD) hoặc 4K Ultra HD' },
    { title: 'Chuột & Thiết bị', icon: 'mouse-pointer', full: 'Chuột quang 3 nút có con lăn (Wheel Mouse) hoạt động tốt trên môi trường CAD' },
  ];

  return (
    <section id="requirements" className="scroll-mt-32 border-t border-slate-200 bg-slate-50 py-12 sm:py-16 lg:scroll-mt-36">
      <span id="yeu-cau-he-thong" className="sr-only" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-blue-900">
            <CmsIcon name="shield-check" className="h-4 w-4 text-blue-700" />
            <span>{req.eyebrow || 'Tiêu Chuẩn Phần Cứng & Tương Thích'}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {req.title || 'YÊU CẦU HỆ THỐNG CÀI ĐẶT CMS INTELLICAD'}
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-600 sm:text-base">
            {req.description || 'CMS IntelliCAD được tối ưu hóa dung lượng nhẹ, khởi động nhanh và tương thích hoàn hảo trên nhiều phân khúc máy tính.'}
          </p>
        </div>

        {/* Desktop Table */}
        <div className="overflow-hidden rounded-2xl border border-blue-900/30 bg-white shadow-xl">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 text-[15px] font-extrabold uppercase tracking-wide text-white">
                  <th className="w-1/5 border-r border-blue-800/60 px-6 py-4 text-center">{headers.component}</th>
                  <th className="w-2/5 border-r border-blue-800/60 px-6 py-4 text-center">
                    <span>{headers.minimum}</span>
                    <br />
                    <span className="text-[13px] font-normal normal-case text-slate-300">{headers.old}</span>
                  </th>
                  <th className="w-2/5 px-6 py-4 text-center">
                    <span>{headers.system}</span>
                    <br />
                    <span className="text-[13px] font-bold normal-case text-amber-300">{headers.new}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-base font-medium text-slate-800">
                {specs.map((item: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'}>
                    <td className="flex items-center gap-3 border-r border-slate-200 px-6 py-4 font-bold text-blue-950">
                      <span className="shrink-0 rounded-lg bg-blue-100/80 p-2">
                        <CmsIcon name={item.icon || 'laptop'} className="h-5 w-5 text-blue-700" />
                      </span>
                      <span>{item.title}</span>
                    </td>
                    {item.full ? (
                      <td colSpan={2} className="px-6 py-4 text-center font-semibold leading-relaxed text-slate-700">
                        {item.full}
                      </td>
                    ) : (
                      <>
                        <td className="border-r border-slate-200 px-6 py-4 leading-relaxed text-slate-700">{item.old}</td>
                        <td className="bg-blue-950/5 px-6 py-4 font-semibold leading-relaxed text-slate-950">{item.new}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="divide-y divide-blue-200 md:hidden">
            <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 p-4 text-center text-sm font-black uppercase text-white">
              {req.mobile_title || 'Bảng Cấu Hình Yêu Cầu'}
            </div>
            {specs.map((item: any, idx: number) => (
              <div key={idx} className="space-y-3 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-black text-blue-950">
                  <span className="rounded-lg bg-blue-100 p-1.5">
                    <CmsIcon name={item.icon || 'laptop'} className="h-5 w-5 text-blue-700" />
                  </span>
                  <span>{item.title}</span>
                </div>
                {item.full ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-[13px] font-medium leading-relaxed text-slate-700">
                    {item.full}
                  </div>
                ) : (
                  <div className="grid gap-2 text-[13px]">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-1 text-xs font-bold text-slate-500">{req.mobile_old || 'Tối thiểu'}</div>
                      <div className="text-slate-700">{item.old}</div>
                    </div>
                    <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3">
                      <div className="mb-1 text-xs font-black text-blue-950">{req.mobile_new || 'Khuyến nghị'}</div>
                      <div className="font-semibold text-slate-900">{item.new}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs font-medium text-slate-700 sm:flex-row sm:text-[13px]">
          <div className="flex items-center gap-2">
            <CmsIcon name="info" className="h-4 w-4 shrink-0 text-blue-700" />
            <span>{req.note || 'Hỗ trợ mượt mà các file DWG nặng hàng trăm Megabyte và nhiều bản vẽ tham chiếu Xref cùng lúc.'}</span>
          </div>
          <a
            href="#dang-ky"
            className="shrink-0 font-bold text-blue-800 hover:text-blue-950 hover:underline"
          >
            {locale === 'en' ? 'Download Free Trial →' : 'Tải bộ cài dùng thử miễn phí →'}
          </a>
        </div>
      </div>
    </section>
  );
}
