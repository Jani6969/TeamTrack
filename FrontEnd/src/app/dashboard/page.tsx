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

  const totalCount = reports.length;
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const correctionCount = reports.filter((r) => r.status === 'NEEDS_CORRECTION').length;
  const latestReport = reports[0];

  return (
    <AppShell title="My Workspace" subtitle="Weekly report submission & progress status">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-500/10 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md mb-3">
            Team Member Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-sm text-brand-100 mt-2 leading-relaxed">
            Keep your team updated with your latest achievements, tasks completed, actual hours, and any blockers.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-brand-50 font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-5 h-5 text-brand-600" />
            <span>Create Weekly Report</span>
          </Link>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Reports"
              value={totalCount}
              subtitle="All time submitted & drafted"
              icon={<FileText className="w-5 h-5" />}
              color="indigo"
            />
            <StatCard
              title="Needs Correction"
              value={correctionCount}
              subtitle="Requires manager requested edits"
              icon={<AlertTriangle className="w-5 h-5" />}
              color={correctionCount > 0 ? 'amber' : 'blue'}
              trend={correctionCount > 0 ? { value: 'Action Required', isPositive: false } : undefined}
            />
            <StatCard
              title="Approved Reports"
              value={approvedCount}
              subtitle="Signed off by engineering manager"
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="emerald"
            />
          </>
        )}
      </div>

      {/* Latest Report Notice (if Needs Correction) */}
      {latestReport?.status === 'NEEDS_CORRECTION' && (
        <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-200 text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Action Needed: Latest Report Needs Correction</div>
              <p className="text-xs text-amber-800 mt-1 max-w-2xl">
                {latestReport.latestReviewComment ||
                  'Your manager requested revisions. Please check the feedback and resubmit.'}
              </p>
            </div>
          </div>
          <Link
            href={`/reports/${latestReport._id}/edit`}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
          >
            <span>Edit & Resubmit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Weekly Reports</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your recent submissions and review progress</p>
          </div>
          <Link
            href="/reports"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading your reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No reports created yet</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">Start your first weekly progress report</p>
            <Link
              href="/reports/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Report</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Reporting Week</th>
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Tasks</th>
                  <th className="py-3.5 px-6">Updated</th>
                  <th className="py-3.5 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reports.slice(0, 5).map((rep) => {
                  const projectName = (typeof rep.project === 'object' && rep.project?.name) ? rep.project.name : (typeof rep.project === 'string' && rep.project ? rep.project : 'Project');
                  return (
                    <tr key={rep._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {formatWeekRange(rep.weekStart, rep.weekEnd)}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{projectName}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={rep.status} />
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {rep.tasks?.length || 0} tasks
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {formatDate(rep.updatedAt || rep.createdAt)}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            href={`/reports/${rep._id}`}
                            className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 flex items-center justify-center transition-all shadow-sm shrink-0"
                            title="View Report"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          {(rep.status === 'DRAFT' || rep.status === 'NEEDS_CORRECTION') && (
                            <Link
                              href={`/reports/${rep._id}/edit`}
                              className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all"
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
