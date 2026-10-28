import React from 'react';
import { rollbackRevisionAction } from '../actions';

interface RevisionsTabProps {
  pageId: string;
  revisions: Array<{
    landing_content_revision_id: string;
    revision_number: number;
    revision_summary: string | null;
    created_by: string;
    created_at_utc: Date;
    revision_snapshot_json: any;
  }>;
}

export function RevisionsTab({ pageId, revisions }: RevisionsTabProps) {
  if (revisions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-500">
        Chưa có snapshot revision nào.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Lịch Sử Phiên Bản &amp; Khôi Phục (Revisions)</h2>
        <span className="text-xs text-slate-500">1-Click Rollback toàn bộ cấu trúc sections &amp; payload</span>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {revisions.map((rev) => (
          <div key={rev.landing_content_revision_id} className="flex items-center justify-between p-4 hover:bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-100 px-2 py-0.5 font-mono text-xs font-black text-blue-900">
                  v{rev.revision_number}
                </span>
                <strong className="text-sm font-bold text-slate-900">
                  {rev.revision_summary || 'Bản ghi snapshot nội dung'}
                </strong>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                <span>Người lưu: <strong>{rev.created_by}</strong></span>
                <span>•</span>
                <span>{new Date(rev.created_at_utc).toLocaleString('vi-VN')}</span>
                <span>•</span>
                <span>{rev.revision_snapshot_json?.sections?.length || 0} sections</span>
              </div>
            </div>

            <form action={rollbackRevisionAction}>
              <input type="hidden" name="page_id" value={pageId} />
              <input type="hidden" name="revision_number" value={rev.revision_number} />
              <button
                type="submit"
                className="cursor-pointer whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95"
              >
                Khôi phục bản này
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
