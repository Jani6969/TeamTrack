'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { dashboardService } from '@/services/dashboardService';
import { MemberStatusItem } from '@/types';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { Users, ChevronRight, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';

export default function TeamDirectoryPage() {
  const [members, setMembers] = useState<MemberStatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getStatusByMember()
      .then((data) => setMembers(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      allowedRoles={['MANAGER', 'ADMIN']}
      title="Team Members Directory"
      subtitle="Overview of all reporting engineers and their submission track records"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Engineers & Contributors</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any member to inspect their full historical submissions</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {members.length} Members
          </span>
        </div>

        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No team members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[650px]">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Member Name</th>
                  <th className="py-3.5 px-6">Total Reports</th>
                  <th className="py-3.5 px-6">Approved</th>
                  <th className="py-3.5 px-6">Pending</th>
                  <th className="py-3.5 px-6">Needs Correction</th>
                  <th className="py-3.5 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {members.map((m) => (
                  <tr key={m.userId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                          {(m.name || 'User').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="text-xs text-slate-400">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{m.totalReports}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {m.approved}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {m.submitted}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        {m.needsCorrection}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/manager/team/${m.userId}`}
                        className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm gap-1.5 transition-all"
                      >
                        <span>View Profile</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
