'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  getManagerReportById,
  approveReport,
  requestCorrection,
} from '@/api/manager';
import { getReportReviews } from '@/api/reports';
import { Report, Review } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge, TaskStatusBadge } from '@/components/ui/PriorityBadge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatWeekRange, formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckSquare,
  Clock,
  Award,
  FileText,
  User,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export default function ManagerReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { success: toastSuccess, error: toastError } = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval state
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  // Request Correction modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionComment, setCorrectionComment] = useState('');
  const [requestingCorrection, setRequestingCorrection] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      try {
        const [rep, revs] = await Promise.all([
          getManagerReportById(id),
          getReportReviews(id).catch(() => []),
        ]);
        setReport(rep);
        setReviews(revs || []);
      } catch (err: any) {
        toastError(err.message || 'Failed to load report for review');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, toastError]);

  const handleApprove = async () => {
    if (!report) return;
    setApproving(true);
    try {
      const res = await approveReport(report._id, approvalNote.trim() || 'Report approved');
      setReport(res.report);
      setReviews((prev) => [res.review, ...prev]);
      setShowApproveConfirm(false);
      toastSuccess('Report approved successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to approve report');
    } finally {
      setApproving(false);
    }
  };

  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    if (!correctionComment.trim()) {
      toastError('Please provide review comments explaining the requested corrections.');
      return;
    }

    setRequestingCorrection(true);
    try {
      const res = await requestCorrection(report._id, correctionComment.trim());
      setReport(res.report);
      setReviews((prev) => [res.review, ...prev]);
      setShowCorrectionModal(false);
      setCorrectionComment('');
      toastSuccess('Correction request sent to team member!');
    } catch (err: any) {
      toastError(err.message || 'Failed to request corrections');
    } finally {
      setRequestingCorrection(false);
    }
  };

  if (loading) {
    return (
      <AppShell allowedRoles={['MANAGER', 'ADMIN']} title="Review Report">
        <div className="flex flex-col items-center justify-center p-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading report review...</p>
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell allowedRoles={['MANAGER', 'ADMIN']} title="Not Found">
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
          <h3 className="text-base font-bold text-slate-900">Report Not Found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">This report could not be retrieved.</p>
          <Link href="/manager/reports" className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
            Back to Team Reports
          </Link>
        </div>
      </AppShell>
    );
  }

  const memberName = (typeof report.user === 'object' && report.user?.name) ? report.user.name : (typeof report.user === 'string' && report.user ? report.user : 'Team Member');
  const memberEmail = (typeof report.user === 'object' && report.user?.email) ? report.user.email : '';
  const projName = (typeof report.project === 'object' && report.project?.name) ? report.project.name : (typeof report.project === 'string' && report.project ? report.project : 'Project');

  const totalHours =
    (report.hoursWorked?.development || 0) +
    (report.hoursWorked?.testing || 0) +
    (report.hoursWorked?.meetings || 0) +
    (report.hoursWorked?.documentation || 0) +
    (report.hoursWorked?.other || 0);

  const canReview = report.status === 'SUBMITTED';

  return (
    <AppShell
      allowedRoles={['MANAGER', 'ADMIN']}
      title="Manager Review Station"
      subtitle="Examine submitted tasks, audit logged hours, and provide formal feedback"
    >
      {/* Correction Modal */}
      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="Request Changes from Team Member"
        description="Specify the adjustments needed. The report will change to NEEDS_CORRECTION and the member will be notified."
      >
        <form onSubmit={handleRequestCorrection} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Correction Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={correctionComment}
              onChange={(e) => setCorrectionComment(e.target.value)}
              placeholder="e.g. Please update the actual hours spent on the testing task and attach the deliverable PR link."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowCorrectionModal(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestingCorrection}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {requestingCorrection && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>Send Correction Request</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title="Approve Weekly Report"
        message={`Confirm approval for ${memberName}'s report for ${formatWeekRange(report.weekStart, report.weekEnd)}?`}
        confirmText="Yes, Approve Report"
        isLoading={approving}
      />

      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/manager/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Team Reports</span>
          </Link>

          <StatusBadge status={report.status} />
        </div>

        {/* Manager Action Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-300 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Manager Evaluation Control</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              {canReview ? 'Report Ready for Decision' : `Report Status: ${report.status}`}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {canReview
                ? 'Review deliverables, percentages, and logged hours. Approve to close the week or request corrections.'
                : 'This report has already been reviewed.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {canReview && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Request Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowApproveConfirm(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Report</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Report Content Body (Read-Only) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Metadata */}
          <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Employee Submission</div>
              <h2 className="text-xl font-bold text-slate-900">{memberName}</h2>
              <p className="text-xs text-slate-500">{memberEmail}</p>
            </div>

            <div className="sm:text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Week Duration</div>
              <div className="text-sm font-bold text-slate-900">{formatWeekRange(report.weekStart, report.weekEnd)}</div>
              <div className="text-xs text-brand-600 font-semibold mt-0.5">Project: {projName}</div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8 divide-y divide-slate-100">
            {/* Section 1: Tasks */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Tasks & Deliverables</h4>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Task Name & Deliverable</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Planned %</th>
                      <th className="py-2.5 px-3">Actual %</th>
                      <th className="py-2.5 px-3 text-right">Hours (Plan / Act)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {report.tasks?.map((t, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{t.taskName}</div>
                          {t.deliverable && (
                            <div className="text-[11px] text-brand-600 mt-0.5 font-medium">
                              Output: {t.deliverable}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td className="py-3 px-3">
                          <TaskStatusBadge status={t.status} />
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600">{t.plannedPercentage}%</td>
                        <td className="py-3 px-3 font-bold text-brand-700">{t.actualPercentage}%</td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-800">
                          {t.plannedHours}h / {t.actualHours}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Hours Breakdown */}
            <div className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Logged Hours Allocation</h4>
                </div>
                <span className="text-sm font-black text-brand-600">Total: {totalHours} Hours</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Development</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {report.hoursWorked?.development || 0}h
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Testing & QA</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {report.hoursWorked?.testing || 0}h
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Meetings</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {report.hoursWorked?.meetings || 0}h
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Docs</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {report.hoursWorked?.documentation || 0}h
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Other</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {report.hoursWorked?.other || 0}h
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Blockers */}
            <div className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Blockers & Challenges</h4>
              </div>
              {report.blockers ? (
                <div className="space-y-2">
                  {report.keyBlocker && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-800 mr-2">
                        Key Issue
                      </span>
                      {report.keyBlocker}
                    </div>
                  )}
                  <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 whitespace-pre-wrap">
                    {report.blockers}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No blockers reported.</p>
              )}
            </div>

            {/* Section 4: Achievements */}
            <div className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-purple-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Achievements</h4>
              </div>
              {report.achievements ? (
                <div className="space-y-2">
                  {report.keyAchievement && (
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs font-semibold">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-purple-200 text-purple-800 mr-2">
                        Key Win
                      </span>
                      {report.keyAchievement}
                    </div>
                  )}
                  <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 whitespace-pre-wrap">
                    {report.achievements}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No achievements reported.</p>
              )}
            </div>

            {/* Section 5: Planned Tasks */}
            <div className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Next Week Goals</h4>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 whitespace-pre-wrap">
                {report.plannedTasks || 'None specified.'}
              </div>
            </div>

            {/* Section 6: Notes */}
            {report.notes && (
              <div className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Notes & Attachments</h4>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 whitespace-pre-wrap">
                  {report.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Audit History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Review Audit Trail</h4>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No past reviews recorded on this submission.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className={`p-4 rounded-xl border text-xs ${
                    rev.action === 'APPROVED'
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900">
                      {rev.reviewer?.name || 'Manager'} –{' '}
                      <span className={rev.action === 'APPROVED' ? 'text-emerald-700' : 'text-amber-700'}>
                        {rev.action}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDateTime(rev.createdAt)}</span>
                  </div>
                  <p className="text-slate-800 italic">&ldquo;{rev.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
