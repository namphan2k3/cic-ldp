'use client';

import React from 'react';

interface TemplateErrorBoundaryProps {
  siteName: string;
  hotline?: string;
  children: React.ReactNode;
}

interface TemplateErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class TemplateErrorBoundary extends React.Component<
  TemplateErrorBoundaryProps,
  TemplateErrorBoundaryState
> {
  constructor(props: TemplateErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): TemplateErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Lỗi hiển thị giao diện cục bộ',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 text-center text-white">
          <div className="max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
            <div className="text-xs font-bold tracking-wider text-orange-400 uppercase">
              Cô lập sự cố độc lập (Fault Isolation Boundary)
            </div>
            <h1 className="mt-2 text-lg font-bold">{this.props.siteName}</h1>
            <p className="mt-2 text-xs text-slate-300">
              Trang đang được đồng bộ lại dữ liệu cấu hình. Các tên miền khác trên hệ thống vẫn
              hoạt động bình thường 100%.
            </p>
            {this.props.hotline && (
              <p className="mt-3 text-xs font-bold text-orange-400">
                Hotline hỗ trợ trực tiếp: {this.props.hotline}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
