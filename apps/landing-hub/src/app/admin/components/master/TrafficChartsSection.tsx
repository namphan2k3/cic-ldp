'use client';

import React, { useState } from 'react';

export interface DailyTrafficPoint {
  isoDate: string;
  date: string;
  views: number;
  uniqueVisitors: number;
  leads: number;
  sampleCustomers?: string[];
}

interface TrafficChartsSectionProps {
  dailySeries: DailyTrafficPoint[];
  scopeLabel: string;
}

export function TrafficChartsSection({ dailySeries, scopeLabel }: TrafficChartsSectionProps) {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(14);
  const [metricMode, setMetricMode] = useState<'leads' | 'views'>('leads');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const visibleSeries = dailySeries.slice(-rangeDays);
  const activePoint =
    (selectedIdx !== null && visibleSeries[selectedIdx]) ||
    visibleSeries[visibleSeries.length - 1] ||
    null;

  const totalViews = visibleSeries.reduce((acc, d) => acc + d.views, 0);
  const totalUnique = visibleSeries.reduce((acc, d) => acc + d.uniqueVisitors, 0);
  const totalLeads = visibleSeries.reduce((acc, d) => acc + d.leads, 0);
  const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(2) : '0.00';

  const maxBarValue =
    metricMode === 'views'
      ? Math.max(100, ...visibleSeries.map((d) => d.views))
      : Math.max(5, ...visibleSeries.map((d) => d.leads));

  const yTicks = [
    maxBarValue,
    Math.round(maxBarValue * 0.75),
    Math.round(maxBarValue * 0.5),
    Math.round(maxBarValue * 0.25),
    0,
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
      {/* Top Header & Controls */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#0b1b36]">
              Thống kê Lượt xem trang &amp; Khách đăng ký theo Ngày
            </h3>
            <span className="rounded-md border border-orange-200 bg-[#fff7ed] px-2.5 py-0.5 text-xs font-bold text-[#c2410c]">
              {scopeLabel}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Theo dõi chi tiết lượt xem trang, khách truy cập duy nhất và tỷ lệ chuyển đổi từng ngày
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Mode Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMetricMode('views')}
              className={`cursor-pointer rounded-md px-3 py-1 font-bold transition ${
                metricMode === 'views'
                  ? 'bg-[#0b1b36] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lượt xem &amp; Truy cập
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('leads')}
              className={`cursor-pointer rounded-md px-3 py-1 font-bold transition ${
                metricMode === 'leads'
                  ? 'bg-[#0b1b36] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khách đăng ký ({totalLeads})
            </button>
          </div>

          {/* Days Range Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
            {[
              { days: 7 as const, label: '7 ngày' },
              { days: 14 as const, label: '14 ngày' },
              { days: 30 as const, label: '30 ngày' },
            ].map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => {
                  setRangeDays(r.days);
                  setSelectedIdx(null);
                }}
                className={`cursor-pointer rounded-md px-2.5 py-1 font-bold transition ${
                  rangeDays === r.days
                    ? 'bg-[#ea580c] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Summary Cards for the Selected Period */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 sm:grid-cols-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0b1b36] uppercase">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#0b1b36]" /> Lượt xem ({rangeDays} ngày)
          </div>
          <div className="mt-0.5 text-xl font-bold text-[#0b1b36] tabular-nums">
            {totalViews.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">lượt</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Trung bình {Math.round(totalViews / Math.max(1, visibleSeries.length))} lượt/ngày
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 uppercase">
            <span className="h-2.5 w-2.5 rounded-xs bg-sky-600" /> Khách truy cập duy nhất
          </div>
          <div className="mt-0.5 text-xl font-bold text-sky-700 tabular-nums">
            {totalUnique.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">người</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Trung bình {Math.round(totalUnique / Math.max(1, visibleSeries.length))} người/ngày
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#ea580c] uppercase">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#ea580c]" /> Khách đăng ký ({rangeDays} ngày)
          </div>
          <div className="mt-0.5 text-xl font-bold text-[#ea580c] tabular-nums">
            {totalLeads.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">khách</span>
          </div>
          <div className="text-[11px] text-slate-500">Gửi biểu mẫu tư vấn trong kỳ</div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-emerald-700 uppercase">
            Tỷ lệ chuyển đổi
          </div>
          <div className="mt-0.5 text-xl font-bold text-emerald-700 tabular-nums">
            {conversionRate}%
          </div>
          <div className="text-[11px] text-slate-500">Đăng ký / Tổng lượt xem trang</div>
        </div>
      </div>

      {/* Main Chart Area — Date Labels Separated Below the Bottom Line for 100% Contrast */}
      <div className="mt-5 flex gap-3">
        {/* Left Y-Axis Scale */}
        <div className="flex h-52 w-9 shrink-0 flex-col justify-between text-right font-mono text-[11px] font-bold text-slate-400">
          {yTicks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>

        {/* Plot Container */}
        <div className="flex-1">
          {/* Bar Area Strictly Above Baseline */}
          <div className="relative h-52 border-b border-slate-300">
            {/* Horizontal Dashed Gridlines */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              {yTicks.map((_, i) => (
                <div
                  key={i}
                  className={i === yTicks.length - 1 ? '' : 'w-full border-b border-dashed border-slate-200/80'}
                />
              ))}
            </div>

            {/* Bars Grid */}
            <div
              className="relative z-10 grid h-full items-end gap-1 pt-5"
              style={{
                gridTemplateColumns: `repeat(${Math.max(1, visibleSeries.length)}, minmax(0, 1fr))`,
              }}
            >
              {visibleSeries.map((d, idx) => {
                const isSelected =
                  selectedIdx === idx ||
                  (selectedIdx === null && idx === visibleSeries.length - 1);

                const primaryVal = metricMode === 'views' ? d.views : d.leads;
                const primaryHeightPct = Math.round((primaryVal / maxBarValue) * 100);
                const secondaryHeightPct = Math.round((d.uniqueVisitors / maxBarValue) * 100);

                return (
                  <div
                    key={d.isoDate}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    onClick={() => setSelectedIdx(idx)}
                    className={`group flex h-full cursor-pointer flex-col items-center justify-end rounded-t-lg px-0.5 transition ${
                      isSelected ? 'bg-orange-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Value Label Above Bar */}
                    <span
                      className={`mb-1 font-mono text-[10px] font-bold tabular-nums ${
                        isSelected ? 'text-[#ea580c]' : 'text-slate-700'
                      }`}
                    >
                      {primaryVal}
                    </span>

                    {/* Bars */}
                    <div className="flex h-[168px] w-full items-end justify-center gap-0.5">
                      {metricMode === 'views' ? (
                        <>
                          <div
                            style={{ height: `${Math.max(8, primaryHeightPct)}%` }}
                            className={`w-full max-w-[16px] rounded-t transition-all ${
                              isSelected ? 'bg-[#ea580c]' : 'bg-[#0b1b36] group-hover:bg-[#1e3a5f]'
                            }`}
                            title={`Ngày ${d.date}: ${d.views} lượt xem`}
                          />
                          {rangeDays <= 14 && (
                            <div
                              style={{ height: `${Math.max(6, secondaryHeightPct)}%` }}
                              className="w-full max-w-[12px] rounded-t bg-sky-500/85 transition-all"
                              title={`Ngày ${d.date}: ${d.uniqueVisitors} khách truy cập duy nhất`}
                            />
                          )}
                        </>
                      ) : (
                        <div
                          style={{ height: `${Math.max(d.leads > 0 ? 12 : 3, primaryHeightPct)}%` }}
                          className={`w-full max-w-[22px] rounded-t transition-all ${
                            d.leads > 0 ? 'bg-[#ea580c]' : 'bg-slate-200'
                          }`}
                          title={`Ngày ${d.date}: ${d.leads} khách đăng ký`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated X-Axis Date Row BELOW the Baseline (High Contrast, Never Overlaps Bars) */}
          <div
            className="mt-2 grid gap-1 text-center"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, visibleSeries.length)}, minmax(0, 1fr))`,
            }}
          >
            {visibleSeries.map((d, idx) => {
              const isSelected =
                selectedIdx === idx ||
                (selectedIdx === null && idx === visibleSeries.length - 1);
              return (
                <button
                  key={d.isoDate}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`cursor-pointer rounded py-0.5 font-mono text-[10px] tabular-nums transition ${
                    isSelected
                      ? 'bg-[#ea580c] font-bold text-white'
                      : 'font-semibold text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {d.date}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Detailed Highlight Banner */}
      {activePoint && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded bg-[#0b1b36] px-2.5 py-1 font-mono text-xs font-bold text-white">
              Ngày {activePoint.date}/2026
            </span>
            <span className="text-slate-700">
              Lượt xem trang: <strong className="font-mono text-[#0b1b36]">{activePoint.views}</strong>
            </span>
            <span className="text-slate-700">
              Khách duy nhất:{' '}
              <strong className="font-mono text-sky-700">{activePoint.uniqueVisitors}</strong>
            </span>
            <span className="text-slate-700">
              Khách đăng ký:{' '}
              <strong className="font-mono text-[#ea580c]">{activePoint.leads}</strong>
            </span>
            <span className="text-slate-700">
              Chuyển đổi:{' '}
              <strong className="font-mono text-emerald-700">
                {activePoint.views > 0
                  ? `${((activePoint.leads / activePoint.views) * 100).toFixed(2)}%`
                  : '0%'}
              </strong>
            </span>
          </div>
          {activePoint.sampleCustomers && activePoint.sampleCustomers.length > 0 && (
            <div className="text-slate-600">
              Khách đăng ký: <strong>{activePoint.sampleCustomers.join(', ')}</strong>
            </div>
          )}
        </div>
      )}

      {/* Detailed Daily Table (Concrete Numbers for Every Single Day) */}
      <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-slate-200">
        <table className="cms-data-table w-full text-left">
          <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
            <tr>
              <th>Ngày</th>
              <th className="text-right">Lượt xem trang</th>
              <th className="text-right">Khách truy cập duy nhất</th>
              <th className="text-right">Khách đăng ký (Leads)</th>
              <th className="text-right">Tỷ lệ chuyển đổi</th>
              <th>Ghi chú khách đăng ký</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...visibleSeries].reverse().map((d) => {
              const cr = d.views > 0 ? ((d.leads / d.views) * 100).toFixed(2) : '0.00';
              return (
                <tr key={d.isoDate} className="hover:bg-slate-50/80">
                  <td className="font-mono font-bold text-[#0b1b36]">{d.date}/2026</td>
                  <td className="text-right font-mono font-bold text-slate-900">
                    {d.views.toLocaleString('vi-VN')}
                  </td>
                  <td className="text-right font-mono font-semibold text-sky-700">
                    {d.uniqueVisitors.toLocaleString('vi-VN')}
                  </td>
                  <td className="text-right font-mono font-bold text-[#ea580c]">{d.leads}</td>
                  <td className="text-right font-mono text-xs font-semibold text-emerald-700">
                    {cr}%
                  </td>
                  <td className="text-xs text-slate-600">
                    {d.sampleCustomers && d.sampleCustomers.length > 0
                      ? d.sampleCustomers.join(', ')
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
