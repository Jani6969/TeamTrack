'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { managerService } from '@/services/managerService';
import { projectService } from '@/services/projectService';
import { Report, Project } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatWeekRange, formatDate } from '@/lib/utils';
import {
  FileCheck2,
  Search,
  Filter,
  User,
  Calendar,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function ManagerReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    projectService.getProjects().then(setProjects).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await managerService.getManagerReports({
          page,
          limit,
          status: statusFilter || undefined,
          projectId: projectFilter || undefined,
        });
        setReports(data.reports || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to load team reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page, statusFilter, projectFilter]);

  const filteredReports = reports.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const userName = (typeof r.user === 'object' && r.user?.name) ? r.user.name.toLowerCase() : '';
    const userEmail = (typeof r.user === 'object' && r.user?.email) ? r.user.email.toLowerCase() : '';
    const projName = (typeof r.project === 'object' && r.project?.name) ? r.project.name.toLowerCase() : '';
    return userName?.includes(term) || userEmail?.includes(term) || projName?.includes(term);
  });

  return (
    <AppShell
      allowedRoles={['MANAGER', 'ADMIN']}
      title="Team Weekly Reports"
      subtitle="Review team member submissions, evaluate deliverables, and approve or request changes"
    >
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search member or project..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted (Pending Review)</option>
            <option value="NEEDS_CORRECTION">Needs Correction</option>
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Total: <span className="text-slate-900">{total}</span> reports
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No team reports found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the status or project filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[720px]">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Team Member</th>
                    <th className="py-3.5 px-6">Week Range</th>
                    <th className="py-3.5 px-6">Project</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Submitted Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredReports.map((rep) => {
                    const memberName = (typeof rep.user === 'object' && rep.user?.name) ? rep.user.name : (typeof rep.user === 'string' && rep.user ? rep.user : 'Team Member');
                    const memberEmail = (typeof rep.user === 'object' && rep.user?.email) ? rep.user.email : '';
                    const projName = (typeof rep.project === 'object' && rep.project?.name) ? rep.project.name : (typeof rep.project === 'string' && rep.project ? rep.project : 'Project');

                    return (
                      <tr key={rep._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {(memberName || 'Team Member').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{memberName}</div>
                              <div className="text-[11px] text-slate-400">{memberEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {formatWeekRange(rep.weekStart, rep.weekEnd)}
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{projName}</td>
                        <td className="py-4 px-6">
                          <StatusBadge status={rep.status} />
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500">
                          {formatDate(rep.submittedAt || rep.createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/reports/${rep._id}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                              title="View Document"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <Link
                              href={`/manager/reports/${rep._id}/review`}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                rep.status === 'SUBMITTED'
                                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {rep.status === 'SUBMITTED' ? 'Review Now' : 'Review Details'}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={limit}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
