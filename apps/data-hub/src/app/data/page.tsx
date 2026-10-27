import Link from 'next/link';
import { Database, Download, History, RotateCcw } from 'lucide-react';
import {
  getDb,
  type CicSheetRowChangeRow,
  type CicSheetRowRecord,
  type CicSheetSourceRow,
  type SheetColumnDefinition,
} from '@cic/db';
import { restoreRowVersionAction, syncSingleSheetSourceAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function DynamicSheetDataPage({
  searchParams,
}: {
  searchParams: Promise<{
    source?: string;
    q?: string;
    state?: string;
    rowHistory?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const sql = getDb();

  const sources = await sql<CicSheetSourceRow[]>`
    SELECT * FROM public.cic_sheet_sources
    WHERE deleted_at IS NULL
    ORDER BY id ASC
  `;

  if (sources.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
        <Database className="w-10 h-10 text-slate-400 mx-auto" />
        <h1 className="text-lg font-bold text-slate-900">Chưa có nguồn Google Sheet nào</h1>
        <p className="text-sm text-slate-500">
          Hãy thêm nguồn Google Sheet tại mục Quản lý Nguồn Sheet để xem dữ liệu cột động.
        </p>
        <Link
          href="/sheets"
          className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
        >
          + Thêm nguồn Google Sheet
        </Link>
      </div>
    );
  }

  const activeSource =
    sources.find((s) => s.code === params.source || String(s.id) === params.source) || sources[0];

  const schema: SheetColumnDefinition[] = (
    Array.isArray(activeSource.column_schema) ? activeSource.column_schema : []
  ).filter((c) => !c.hidden);

  const searchQuery = (params.q || '').trim();
  const stateFilter = params.state || 'active'; // 'active' | 'removed' | 'all'
  const pageNum = Math.max(1, Number(params.page || 1));
  const pageSize = 50;
  const offset = (pageNum - 1) * pageSize;

  const rows = await sql<CicSheetRowRecord[]>`
    SELECT *
    FROM public.cic_sheet_rows
    WHERE source_id = ${activeSource.id}
      ${
        stateFilter === 'active'
          ? sql`AND removed_at IS NULL`
          : stateFilter === 'removed'
            ? sql`AND removed_at IS NOT NULL`
            : sql``
      }
      ${searchQuery ? sql`AND data::text ILIKE ${'%' + searchQuery + '%'}` : sql``}
    ORDER BY COALESCE(row_number, 999999) ASC, id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  const [countRes] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count
    FROM public.cic_sheet_rows
    WHERE source_id = ${activeSource.id}
      ${
        stateFilter === 'active'
          ? sql`AND removed_at IS NULL`
          : stateFilter === 'removed'
            ? sql`AND removed_at IS NOT NULL`
            : sql``
      }
      ${searchQuery ? sql`AND data::text ILIKE ${'%' + searchQuery + '%'}` : sql``}
  `;
  const totalCount = countRes?.count ?? 0;

  // Optional row change history drawer
  const inspectRowId = params.rowHistory ? Number(params.rowHistory) : null;
  const rowChanges = inspectRowId
    ? await sql<(CicSheetRowChangeRow & { trigger: string })[]>`
        SELECT c.*, r.trigger
        FROM public.cic_sheet_row_changes c
        JOIN public.cic_sheet_sync_runs r ON r.id = c.run_id
        WHERE c.row_id = ${inspectRowId}
        ORDER BY c.changed_at DESC
        LIMIT 20
      `
    : [];

  return (
    <div className="space-y-6">
      {/* Source Selector Tabs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Dữ liệu Google Sheets — Bảng Cột Động ({activeSource.name})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu trúc bảng tự động thích ứng theo <code className="font-mono">column_schema</code>{' '}
              của từng Sheet ({schema.length} cột đang hiển thị).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/export/sheets/${activeSource.id}?format=xlsx`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất Excel (.xlsx)
            </a>
            <a
              href={`/api/export/sheets/${activeSource.id}?format=csv`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất CSV (.csv)
            </a>
            <form action={syncSingleSheetSourceAction}>
              <input type="hidden" name="source_id" value={activeSource.id} />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                Đồng bộ lại Sheet này
              </button>
            </form>
          </div>
        </div>

        {/* Source Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {sources.map((s) => (
            <Link
              key={s.id}
              href={`/data?source=${s.code}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                s.id === activeSource.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.name} ({s.sheet_name})
            </Link>
          ))}
        </div>

        {/* Filter Bar */}
        <form method="GET" action="/data" className="flex flex-wrap items-center gap-3 pt-2">
          <input type="hidden" name="source" value={activeSource.code} />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Tìm theo tên, SĐT, email, công ty hoặc trường bất kỳ..."
            className="flex-1 min-w-[260px] px-3.5 py-2 text-sm rounded-lg border border-slate-300"
          />
          <select
            name="state"
            defaultValue={stateFilter}
            className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
          >
            <option value="active">Đang có trên Sheet (Active)</option>
            <option value="removed">Đã bị xóa trên Sheet (Được DB giữ lại)</option>
            <option value="all">Tất cả dòng</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium cursor-pointer"
          >
            Lọc dữ liệu
          </button>
          <span className="text-xs text-slate-500">
            Tổng số: <strong>{totalCount.toLocaleString('vi-VN')}</strong> dòng
          </span>
        </form>
      </div>

      {/* Row Change History Inspector (if selected) */}
      {inspectRowId && (
        <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-700" />
              Lịch sử biến động &amp; Khôi phục Dòng #{inspectRowId} ({rowChanges.length} bản ghi)
            </h2>
            <Link
              href={`/data?source=${activeSource.code}&q=${encodeURIComponent(searchQuery)}&state=${stateFilter}`}
              className="text-xs font-medium text-amber-900 hover:underline"
            >
              Đóng lịch sử &times;
            </Link>
          </div>
          <div className="space-y-2">
            {rowChanges.map((ch) => (
              <div
                key={ch.id}
                className="bg-white p-3.5 rounded-lg border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1 min-w-[300px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold uppercase bg-slate-100 text-slate-800">
                      {ch.change_type}
                    </span>
                    <span className="text-slate-500">
                      {new Date(ch.changed_at).toLocaleString('vi-VN')} (trigger: {ch.trigger})
                    </span>
                  </div>
                  <pre className="text-[11px] bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto text-slate-700">
                    {JSON.stringify(ch.new_data || ch.old_data, null, 2)}
                  </pre>
                </div>

                <form action={restoreRowVersionAction}>
                  <input type="hidden" name="row_id" value={inspectRowId} />
                  <input type="hidden" name="change_id" value={ch.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Khôi phục phiên bản này
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-3 whitespace-nowrap">Dòng Sheet</th>
                {schema.map((col) => (
                  <th key={col.key} className="px-3.5 py-3 whitespace-nowrap">
                    <div>{col.header}</div>
                    <div className="text-[10px] font-mono text-slate-400 lowercase">
                      {col.key} ({col.type})
                    </div>
                  </th>
                ))}
                <th className="px-3.5 py-3 whitespace-nowrap">Cập nhật cuối</th>
                <th className="px-3.5 py-3 text-right whitespace-nowrap">Lịch sử</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={schema.length + 3}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    Không có dòng dữ liệu nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const data = row.data || {};
                  const isRemoved = Boolean(row.removed_at);
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50 ${isRemoved ? 'bg-rose-50/40 text-slate-500' : ''}`}
                    >
                      <td className="px-3.5 py-2.5 font-mono text-slate-500 whitespace-nowrap">
                        #{row.row_number ?? '-'}
                        {isRemoved && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-sans font-semibold">
                            Đã xóa trên Sheet
                          </span>
                        )}
                      </td>
                      {schema.map((col) => {
                        const rawVal = data[col.key];
                        const strVal =
                          rawVal !== null && rawVal !== undefined ? String(rawVal) : '';
                        return (
                          <td
                            key={col.key}
                            className="px-3.5 py-2.5 max-w-[260px] truncate text-slate-800"
                            title={strVal}
                          >
                            {col.type === 'phone' && strVal ? (
                              <span className="font-mono font-medium text-blue-700">{strVal}</span>
                            ) : col.type === 'url' && strVal.startsWith('http') ? (
                              <a
                                href={strVal}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {strVal}
                              </a>
                            ) : (
                              strVal
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3.5 py-2.5 text-slate-500 whitespace-nowrap">
                        {new Date(row.updated_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <Link
                          href={`/data?source=${activeSource.code}&q=${encodeURIComponent(searchQuery)}&state=${stateFilter}&page=${pageNum}&rowHistory=${row.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                        >
                          <History className="w-3 h-3" />
                          Lịch sử
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span>
              Trang {pageNum} / {Math.ceil(totalCount / pageSize)}
            </span>
            <div className="flex gap-2">
              {pageNum > 1 && (
                <Link
                  href={`/data?source=${activeSource.code}&q=${encodeURIComponent(searchQuery)}&state=${stateFilter}&page=${pageNum - 1}`}
                  className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100"
                >
                  &larr; Trang trước
                </Link>
              )}
              {pageNum * pageSize < totalCount && (
                <Link
                  href={`/data?source=${activeSource.code}&q=${encodeURIComponent(searchQuery)}&state=${stateFilter}&page=${pageNum + 1}`}
                  className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100"
                >
                  Trang tiếp &rarr;
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
