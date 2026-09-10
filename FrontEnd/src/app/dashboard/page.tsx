'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { getMyReports } from '@/api/reports';
import { Report } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatWeekRange, formatDate } from '@/lib/utils';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  Edit3,
} from 'lucide-react';

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getMyReports({ page: 1, limit: 10 });
        setReports(data.reports || []);
      } catch (err) {
        console.error('Failed to load member reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const triggerAICopilot = (prompt?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('teamtrack:open-ai', {
          detail: { prompt, tab: 'chat' },
        })
      );
    }
  };

  const totalCount = reports.length;
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const correctionCount = reports.filter((r) => r.status === 'NEEDS_CORRECTION').length;
  const draftCount = reports.filter((r) => r.status === 'DRAFT').length;
  const latestReport = reports[0];

  return (
    <AppShell title="My Workspace" subtitle="Weekly report submission, task breakdown & compliance tracking">
      {/* 1. Elevated Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/15 mb-8 border border-indigo-800/40">
        {/* Glow circles */}
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-brand-200 border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Engineer Workspace Active
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Engineer'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Log your sprint accomplishments, track logged hours per project, communicate blockers directly with your engineering manager, and get AI feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => triggerAICopilot('Help me write my weekly report bullets based on my achievements')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Report Assistant</span>
            </button>

            <Link
              href="/reports/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all hover:brightness-110 hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Weekly Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Submissions"
              value={totalCount}
              icon={<FileText className="w-4 h-4" />}
              color="indigo"
            />
            <StatCard
              title="Approved Deliverables"
              value={approvedCount}
              icon={<CheckCircle2 className="w-4 h-4" />}
              color="emerald"
            />
            <StatCard
              title="Needs Revision"
              value={correctionCount}
              icon={<AlertTriangle className="w-4 h-4" />}
              color={correctionCount > 0 ? 'amber' : 'blue'}
            />
            <StatCard
              title="Saved Drafts"
              value={draftCount}
              icon={<Clock className="w-4 h-4" />}
              color={draftCount > 0 ? 'blue' : 'indigo'}
            />
          </>
        )}
      </div>

      {/* 3. Latest Report Correction Alert Banner (Conditional) */}
      {latestReport?.status === 'NEEDS_CORRECTION' && (
        <div className="mb-8 p-5 rounded-3xl bg-amber-50/90 border border-amber-300/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-200/80 text-amber-900 shrink-0 mt-0.5 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                <span>Action Required: Revisions Requested on Latest Report</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {formatWeekRange(latestReport.weekStart, latestReport.weekEnd)}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                {latestReport.latestReviewComment ||
                  'Your manager requested revisions. Please check the feedback and resubmit.'}
              </p>
            </div>
          </div>
          <Link
            href={`/reports/${latestReport._id}/edit`}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 hover:scale-105 active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit & Resubmit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4. Recent Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Weekly Reports</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your chronological submissions, review state, and task breakdown</p>
          </div>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-xl bg-brand-50/60 hover:bg-brand-50 border border-brand-200/60 transition-colors self-start sm:self-auto"
          >
            <span>View Full History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading your reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3.5">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No reports created yet</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
              Start your first weekly progress report to log tasks, actual hours, and communicate deliverables.
            </p>
            <Link
              href="/reports/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Report</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[680px]">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Reporting Week</th>
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Task Breakdown</th>
                  <th className="py-3.5 px-6">Last Updated</th>
                  <th className="py-3.5 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reports.slice(0, 5).map((rep) => {
                  const projectName =
                    typeof rep.project === 'object' && rep.project?.name
                      ? rep.project.name
                      : typeof rep.project === 'string' && rep.project
                      ? rep.project
                      : 'General Project';

                  return (
                    <tr key={rep._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                        <span>{formatWeekRange(rep.weekStart, rep.weekEnd)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Layers className="w-3 h-3 text-slate-500" />
                          {projectName}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={rep.status} />
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        <span className="font-bold text-slate-800">{rep.tasks?.length || 0}</span> tasks logged
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {formatDate(rep.updatedAt || rep.createdAt)}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            href={`/reports/${rep._id}`}
                            className="h-8 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 inline-flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm"
                            title="View Report"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          {(rep.status === 'DRAFT' || rep.status === 'NEEDS_CORRECTION') && (
                            <Link
                              href={`/reports/${rep._id}/edit`}
                              className="h-8 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center whitespace-nowrap bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
