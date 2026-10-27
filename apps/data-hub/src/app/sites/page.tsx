import { getDb, type CicSiteRow } from '@cic/db';
import { runHealthCheckAction, updateSiteConfigAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function SitesManagementPage() {
  const sql = getDb();
  const sites = await sql<CicSiteRow[]>`
    SELECT * FROM public.cic_sites ORDER BY site_type DESC, id ASC
  `;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Quản lý Website &amp; Landing Pages ({sites.length})
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Chỉnh sửa tên miền, trạng thái bảo trì và cấu hình dùng chung (Hotline, Email nhận thông báo, Google Tag Manager, Facebook Pixel, Link tải Trial/Lisp).
          </p>
        </div>
        <form action={runHealthCheckAction}>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium cursor-pointer"
          >
            Kiểm tra HTTP &amp; SSL tất cả Site
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sites.map((site) => {
          const settings = site.settings || {};
          const previewUrl =
            site.site_type === 'portal'
              ? 'http://localhost:4300'
              : `http://localhost:4301/_sites/${site.code}`;
          const editContentUrl =
            site.site_type === 'landing'
              ? `http://localhost:4301/admin?site=${site.code}`
              : null;

          return (
            <div
              key={site.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-mono text-xs font-bold">
                    {site.code}
                  </span>
                  <h2 className="font-bold text-slate-900 text-base">{site.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {site.site_type} &bull; {site.render_mode}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {site.last_check_at && (
                    <span className="text-slate-600">
                      HTTP <strong>{site.last_http_status}</strong> ({site.last_response_ms}ms)
                      {site.ssl_expires_at && (
                        <>
                          {' '}
                          &bull; SSL hết hạn:{' '}
                          {new Date(site.ssl_expires_at).toLocaleDateString('vi-VN')}
                        </>
                      )}
                    </span>
                  )}
                  {editContentUrl && (
                    <a
                      href={editContentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium"
                    >
                      Biên tập nội dung Section &#8599;
                    </a>
                  )}
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                  >
                    Mở trang ({site.code}) &#8599;
                  </a>
                </div>
              </div>

              <form action={updateSiteConfigAction} className="p-6 space-y-4">
                <input type="hidden" name="site_id" value={site.id} />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={site.name}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên miền chính (Primary Domain)
                    </label>
                    <input
                      type="text"
                      name="primary_domain"
                      defaultValue={site.primary_domain || ''}
                      placeholder="vd: cmsintellicad.vn"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên miền phụ (cách nhau dấu phẩy)
                    </label>
                    <input
                      type="text"
                      name="domains"
                      defaultValue={(site.domains || []).join(', ')}
                      placeholder="www.cmsintellicad.vn, intellicad.cic.com.vn"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Trạng thái vận hành
                    </label>
                    <select
                      name="status"
                      defaultValue={site.status}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="active">Hoạt động (Active)</option>
                      <option value="maintenance">Bảo trì (Maintenance)</option>
                      <option value="archived">Lưu trữ (Archived)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số Hotline hiển thị
                    </label>
                    <input
                      type="text"
                      name="hotline"
                      defaultValue={String(settings.hotline || '')}
                      placeholder="0988 123 456"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email nhận thông báo Form
                    </label>
                    <input
                      type="text"
                      name="notify_emails"
                      defaultValue={
                        Array.isArray(settings.notify_emails)
                          ? settings.notify_emails.join(', ')
                          : String(settings.notify_emails || '')
                      }
                      placeholder="nampt@cic.com.vn, info@cic.com.vn"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Tag Manager ID (GTM)
                    </label>
                    <input
                      type="text"
                      name="gtm_id"
                      defaultValue={String(settings.gtm_id || '')}
                      placeholder="GTM-XXXXXXX"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      name="fb_pixel_id"
                      defaultValue={String(settings.fb_pixel_id || '')}
                      placeholder="1234567890"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link Zalo tư vấn
                    </label>
                    <input
                      type="text"
                      name="zalo_url"
                      defaultValue={String(settings.zalo_url || '')}
                      placeholder="https://zalo.me/..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link tải bản dùng thử (Trial Download URL)
                    </label>
                    <input
                      type="text"
                      name="trial_download_url"
                      defaultValue={String(settings.trial_download_url || '')}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link tải Bộ Lisp / Tài liệu đính kèm
                    </label>
                    <input
                      type="text"
                      name="lisp_download_url"
                      defaultValue={String(settings.lisp_download_url || '')}
                      placeholder="/sites/cms-intellicad/downloads/Lisp-Intellicad.rar"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tiêu đề SEO mặc định (SEO Title)
                    </label>
                    <input
                      type="text"
                      name="seo_title"
                      defaultValue={String(settings.seo_title || '')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mô tả SEO (Meta Description)
                    </label>
                    <input
                      type="text"
                      name="seo_description"
                      defaultValue={String(settings.seo_description || '')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer"
                  >
                    Lưu cấu hình {site.code}
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
