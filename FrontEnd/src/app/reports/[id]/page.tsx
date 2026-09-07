'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { reportService } from '@/services/reportService';
import { Report, Review } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge, TaskStatusBadge } from '@/components/ui/PriorityBadge';
import { formatWeekRange, formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import {
  Calendar,
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  Award,
  FileText,
  User,
  ArrowLeft,
  Edit3,
  MessageSquare,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, isManager } = useAuth();
  const { error: toastError } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchReportData = async () => {
      try {
        const [rep, revs] = await Promise.all([
          reportService.getReportById(id),
          reportService.getReportReviews(id).catch(() => []),
        ]);
        setReport(rep);
        setReviews(revs || []);
      } catch (err: any) {
        toastError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [id, toastError]);

  if (loading) {
    return (
      <AppShell title="Report Details">
        <div className="flex flex-col items-center justify-center p-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading report...</p>
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell title="Report Not Found">
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Access Denied or Not Found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            You do not have permission to access this report or it has been deleted.
          </p>
          <Link
            href={isManager ? '/manager/reports' : '/reports'}
            className="inline-flex px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
          >
            Back to Reports
          </Link>
        </div>
      </AppShell>
    );
  }

  const employeeName = typeof report.user === 'object' ? report.user?.name : 'Team Member';
  const employeeEmail = typeof report.user === 'object' ? report.user?.email : '';
  const projectName = typeof report.project === 'object' ? report.project?.name : 'Project';

  const canEdit = report.status === 'DRAFT' || report.status === 'NEEDS_CORRECTION';

  const totalHours =
    (report.hoursWorked?.development || 0) +
    (report.hoursWorked?.testing || 0) +
    (report.hoursWorked?.meetings || 0) +
    (report.hoursWorked?.documentation || 0) +
    (report.hoursWorked?.other || 0);

  return (
    <AppShell title="Weekly Report Document" subtitle="Formal team submission overview">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Navigation / Header bar */}
        <div className="flex items-center justify-between">
          <Link
            href={isManager ? '/manager/reports' : '/reports'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Reports List</span>
          </Link>

          <div className="flex items-center gap-3">
            {canEdit && !isManager && (
              <Link
                href={`/reports/${report._id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{report.status === 'NEEDS_CORRECTION' ? 'Revise & Resubmit' : 'Edit Report'}</span>
              </Link>
            )}

            {isManager && (
              <Link
                href={`/manager/reports/${report._id}/review`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <span>Manager Review Screen</span>
              </Link>
            )}
          </div>
        </div>

        {/* Prominent Needs Correction Banner */}
        {report.status === 'NEEDS_CORRECTION' && (
          <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm text-amber-950">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-200 text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-amber-900">Needs Correction – Manager Feedback</h4>
                <p className="text-xs text-amber-800 mt-1 mb-3">
                  This report has been flagged for revisions by your manager. Review the instructions below and make the requested changes.
                </p>
                <div className="p-4 rounded-xl bg-white border border-amber-200 text-sm font-medium text-slate-800 shadow-sm italic">
                  &ldquo;{report.latestReviewComment || 'Please provide updated actual hours and details.'}&rdquo;
                </div>
                {!isManager && (
                  <div className="mt-4">
                    <Link
                      href={`/reports/${report._id}/edit`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit & Resubmit Report</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Document Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Metadata */}
          <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                  Weekly Report
                </span>
                <StatusBadge status={report.status} />
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {formatWeekRange(report.weekStart, report.weekEnd)}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Project:{' '}
                <span className="font-semibold text-slate-200">{projectName}</span>
              </p>
            </div>

            <div className="flex sm:flex-col items-end gap-1.5 sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-xs font-bold">
                  {employeeName.charAt(0)}
                </div>
                <span className="font-semibold text-sm text-white">{employeeName}</span>
              </div>
              <span className="text-xs text-slate-400">{employeeEmail}</span>
              <span className="text-[11px] text-slate-500">
                Submitted: {formatDate(report.submittedAt || report.createdAt)}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8 divide-y divide-slate-100">
            {/* Section 1: Tasks Completed */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">1. Tasks Completed</h3>
              </div>

              {report.tasks?.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No tasks logged.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Task Name & Output</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Plan %</th>
                        <th className="py-2.5 px-3">Act %</th>
                        <th className="py-2.5 px-3 text-right">Hrs (Plan/Act)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.tasks?.map((task, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{task.taskName}</div>
                            {task.deliverable && (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Deliverable: <span className="text-brand-600 font-medium">{task.deliverable}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td className="py-3 px-3">
                            <TaskStatusBadge status={task.status} />
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-600">{task.plannedPercentage}%</td>
                          <td className="py-3 px-3 font-bold text-brand-700">{task.actualPercentage}%</td>
                          <td className="py-3 px-3 text-right font-semibold text-slate-800">
                            {task.plannedHours}h / {task.actualHours}h
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 2: Planned for Next Week */}
            <div className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">2. Planned for Next Week</h3>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {report.plannedTasks || 'No upcoming tasks noted.'}
              </div>
            </div>

            {/* Section 3: Blockers & Challenges */}
            <div className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">3. Blockers & Challenges</h3>
              </div>
              {report.blockers ? (
                <div className="space-y-2">
                  {report.keyBlocker && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm font-semibold flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px] font-black uppercase">
                        Key Issue
                      </span>
                      <span>{report.keyBlocker}</span>
                    </div>
                  )}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                    {report.blockers}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No blockers encountered this week.</p>
              )}
            </div>

            {/* Section 4: Achievements */}
            <div className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">4. Achievements & Wins</h3>
              </div>
              {report.achievements ? (
                <div className="space-y-2">
                  {report.keyAchievement && (
                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs sm:text-sm font-semibold flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-800 text-[10px] font-black uppercase">
                        Key Win
                      </span>
                      <span>{report.keyAchievement}</span>
                    </div>
                  )}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                    {report.achievements}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No achievements noted.</p>
              )}
            </div>

            {/* Section 5: Hours Worked */}
            <div className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-600" />
                  <h3 className="text-base font-bold text-slate-900">5. Hours Worked Breakdown</h3>
                </div>
                <span className="text-sm font-extrabold text-brand-600">Total: {totalHours} hrs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Dev</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {report.hoursWorked?.development || 0}h
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Testing</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {report.hoursWorked?.testing || 0}h
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Meetings</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {report.hoursWorked?.meetings || 0}h
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Docs</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {report.hoursWorked?.documentation || 0}h
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Other</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {report.hoursWorked?.other || 0}h
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: Notes & Links */}
            {report.notes && (
              <div className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <h3 className="text-base font-bold text-slate-900">6. Notes & Attached Links</h3>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                  {report.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manager Review History Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Manager Review History</h3>
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No manager review comments on this report yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className={`p-4 rounded-2xl border ${
                    rev.action === 'APPROVED'
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {rev.action === 'APPROVED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="font-bold text-xs text-slate-900">
                        {rev.reviewer?.name || 'Engineering Manager'}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          rev.action === 'APPROVED'
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-amber-200 text-amber-800'
                        }`}
                      >
                        {rev.action}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{formatDateTime(rev.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-800 italic">&ldquo;{rev.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
