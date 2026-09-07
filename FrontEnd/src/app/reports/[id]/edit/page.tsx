'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ReportForm } from '@/components/reports/ReportForm';
import { reportService } from '@/services/reportService';
import { Report } from '@/types';
import { useToast } from '@/context/ToastContext';
import { AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { error: toastError } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      try {
        const data = await reportService.getReportById(id);
        setReport(data);
      } catch (err: any) {
        toastError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, toastError]);

  if (loading) {
    return (
      <AppShell title="Edit Report">
        <div className="flex flex-col items-center justify-center p-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading report data...</p>
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell title="Report Not Found">
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Report Not Found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            The requested report ID could not be retrieved or you do not have permission.
          </p>
          <Link
            href="/reports"
            className="inline-flex px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
          >
            Back to My Reports
          </Link>
        </div>
      </AppShell>
    );
  }

  // If report is SUBMITTED or APPROVED, it cannot be edited
  if (report.status === 'SUBMITTED' || report.status === 'APPROVED') {
    return (
      <AppShell title="Report Locked">
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Report is Locked for Editing</h3>
          <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
            This report is currently in <span className="font-bold">{report.status}</span> status. Only reports in
            <span className="font-bold"> DRAFT</span> or <span className="font-bold">NEEDS_CORRECTION</span> status can be modified.
          </p>
          <Link
            href={`/reports/${report._id}`}
            className="inline-flex px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors"
          >
            View Read-Only Report
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={report.status === 'NEEDS_CORRECTION' ? 'Revise Weekly Report' : 'Edit Report Draft'}
      subtitle={
        report.status === 'NEEDS_CORRECTION'
          ? 'Address manager feedback and resubmit for approval'
          : 'Modify your draft before final submission'
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Manager feedback banner if in correction mode */}
        {report.status === 'NEEDS_CORRECTION' && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm text-amber-950">
            <div className="font-bold text-sm mb-1 flex items-center gap-2">
              <span className="text-amber-600">⚠️</span>
              <span>Manager Correction Feedback:</span>
            </div>
            <p className="text-sm text-amber-900 bg-white/70 p-3 rounded-xl border border-amber-200 italic">
              &ldquo;{report.latestReviewComment || 'Please revise and resubmit.'}&rdquo;
            </p>
          </div>
        )}

        <ReportForm initialData={report} isEditing={true} />
      </div>
    </AppShell>
  );
}
