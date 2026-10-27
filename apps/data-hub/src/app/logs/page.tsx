import { getDb } from '@cic/db';

export const dynamic = 'force-dynamic';

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string }>;
}) {
  const params = await searchParams;
  const appFilter = params.app || '';
  const sql = getDb();

  const logs = await sql<
    {
      id: string;
      occurred_at: Date;
      actor_label: string | null;
      action_code: string;
      category: string;
      severity: string;
      entity_type: string;
      entity_id: string | null;
      entity_title: string | null;
      result: string;
      result_message: string | null;
      source_app: string | null;
    }[]
  >`
    SELECT
      id,
      occurred_at,
      actor_label,
      action_code,
      category,
      severity,
      entity_type,
      entity_id,
      entity_title,
      result,
      result_message,
      source_app
    FROM public.cic_activity_logs
    WHERE 1=1
      ${appFilter ? sql`AND source_app = ${appFilter}` : sql``}
    ORDER BY occurred_at DESC
    LIMIT 100
  `;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Nhật ký Hoạt động Toàn Hệ sinh thái (<code className="font-mono text-sm">cic_activity_logs</code>)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Ghi nhận bất biến (append-only) mọi thao tác đồng bộ Google Sheets, sao lưu, biên tập Landing Page và quản trị hệ thống.
          </p>
        </div>

        <form method="GET" action="/logs" className="flex items-center gap-2">
          <select
            name="app"
            defaultValue={appFilter}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
          >
            <option value="">Tất cả ứng dụng</option>
            <option value="data-hub">data-hub</option>
            <option value="sync-worker">sync-worker</option>
            <option value="landing-hub">landing-hub</option>
            <option value="cic-web">cic-web</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium cursor-pointer"
          >
            Lọc nhật ký
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Nguồn App</th>
                <th className="px-4 py-3">Tác nhân</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Kết quả &amp; Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.occurred_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {log.source_app || 'cms'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {log.actor_label || 'System'}
                  </td>
                  <td className="px-4 py-3 font-mono text-blue-700">{log.action_code}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {log.entity_title || `${log.entity_type} #${log.entity_id || ''}`}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`mr-2 px-1.5 py-0.5 rounded font-semibold ${
                        log.result === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {log.result}
                    </span>
                    <span className="text-slate-600">{log.result_message || ''}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
