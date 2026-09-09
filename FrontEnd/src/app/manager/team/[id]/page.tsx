'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { userService } from '@/services/userService';
import { managerService } from '@/services/managerService';
import { User, Report } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/ui/StatCard';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatWeekRange, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Shield,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export default function MemberProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [member, setMember] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMemberData = async () => {
      try {
        const [userData, repData] = await Promise.all([
          userService.getUserById(id),
          managerService.getManagerReports({ userId: id, limit: 20 }),
        ]);
        setMember(userData);
        setReports(repData.reports || []);
      } catch (err) {
        console.error('Failed to load member profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [id]);

  const totalReports = reports.length;
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = reports.filter((r) => r.status === 'SUBMITTED').length;
  const correctionCount = reports.filter((r) => r.status === 'NEEDS_CORRECTION').length;

  const complianceRate =
    totalReports > 0 ? Math.round(((approvedCount + pendingCount) / totalReports) * 100) : 100;

  return (
    <AppShell
      allowedRoles={['MANAGER', 'ADMIN']}
      title="Team Member Profile"
      subtitle="Detailed report history and submission compliance"
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation */}
        <Link
          href="/manager/team"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Team Directory</span>
        </Link>

        {/* Member Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-brand-500/20">
              {member?.name ? member.name.charAt(0).toUpperCase() : <UserIcon className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{member?.name || 'Loading...'}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{member?.email}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                  {member?.role}
                </span>
                <span className="text-xs text-slate-400">
                  Member since {formatDate(member?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center sm:border-l sm:border-slate-100 sm:pl-8">
            <div className="text-xs font-bold uppercase text-slate-400">Compliance Rate</div>
            <div className="text-3xl font-black text-brand-600 mt-1">{complianceRate}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">On-time Submissions</div>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Total Reports"
                value={totalReports}
                subtitle="All logged weeks"
                icon={<FileCheck2 className="w-4 h-4" />}
                color="indigo"
              />
              <StatCard
                title="Approved"
                value={approvedCount}
                subtitle="Passed review"
                icon={<CheckCircle2 className="w-4 h-4" />}
                color="emerald"
              />
              <StatCard
                title="Pending"
                value={pendingCount}
                subtitle="Awaiting signoff"
                icon={<Clock className="w-4 h-4" />}
                color="blue"
              />
              <StatCard
                title="Corrections"
                value={correctionCount}
                subtitle="Revisions requested"
                icon={<AlertTriangle className="w-4 h-4" />}
                color={correctionCount > 0 ? 'amber' : 'blue'}
              />
            </>
          )}
        </div>

        {/* Reports History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Submission History</h3>
            <p className="text-xs text-slate-500 mt-0.5">All reports filed by this contributor</p>
          </div>

          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={5} />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No reports on record.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-6">Week Range</th>
                    <th className="py-3 px-6">Project</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Tasks</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reports.map((rep) => {
                    const projName = (typeof rep.project === 'object' && rep.project?.name) ? rep.project.name : (typeof rep.project === 'string' && rep.project ? rep.project : 'Project');
                    return (
                      <tr key={rep._id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-6 font-semibold text-slate-900">
                          {formatWeekRange(rep.weekStart, rep.weekEnd)}
                        </td>
                        <td className="py-3.5 px-6 text-slate-600">{projName}</td>
                        <td className="py-3.5 px-6">
                          <StatusBadge status={rep.status} />
                        </td>
                        <td className="py-3.5 px-6 text-xs text-slate-500">
                          {rep.tasks?.length || 0} tasks
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <Link
                            href={`/manager/reports/${rep._id}/review`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
