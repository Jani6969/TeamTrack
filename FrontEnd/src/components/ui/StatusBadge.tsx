import React from 'react';
import { ReportStatus } from '@/types';
import { CheckCircle2, Clock, AlertTriangle, FileEdit, CircleDashed } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className = '', showIcon = true }: StatusBadgeProps) {
  switch (status) {
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          <span>Approved</span>
        </span>
      );
    case 'SUBMITTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
          <span>Submitted</span>
        </span>
      );
    case 'NEEDS_CORRECTION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-50 text-amber-800 border border-amber-300/90 shadow-2xs ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          <span>Needs Correction</span>
        </span>
      );
    case 'NOT_STARTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs ${className}`}
        >
          {showIcon && <CircleDashed className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
          <span>Not Started</span>
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs ${className}`}
        >
          {showIcon && <FileEdit className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          <span>Draft</span>
        </span>
      );
  }
}
