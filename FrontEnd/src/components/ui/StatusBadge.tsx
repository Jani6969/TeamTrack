import React from 'react';
import { ReportStatus } from '@/types';
import { CheckCircle2, Clock, AlertTriangle, FileEdit } from 'lucide-react';

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
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          Approved
        </span>
      );
    case 'SUBMITTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-blue-600" />}
          Submitted
        </span>
      );
    case 'NEEDS_CORRECTION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
          Needs Correction
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          {showIcon && <FileEdit className="w-3.5 h-3.5 text-slate-500" />}
          Draft
        </span>
      );
  }
}
