'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { reportService } from '@/services/reportService';
import { Report } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatWeekRange, formatDate } from '@/lib/utils';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  ExternalLink,
  Edit3,
  Calendar,
} from 'lucide-react';

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await reportService.getMyReports({
          page,
          limit,
          status: statusFilter || undefined,
        });
        setReports(data.reports || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page, statusFilter]);

  // Client side search across tasks/notes/project name
  const filteredReports = reports.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const projName = (typeof r.project === 'object' && r.project?.name) ? r.project.name.toLowerCase() : '';
    const taskNames = r.tasks?.map((t) => t.taskName.toLowerCase()).join(' ') || '';
    return projName?.includes(term) || taskNames.includes(term) || r.notes?.toLowerCase().includes(term);
  });

  return (
    <AppShell title="My Reports" subtitle="Review history and manage your weekly submissions">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-1 items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports or tasks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="NEEDS_CORRECTION">Needs Correction</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>
        </div>

        <Link
          href="/reports/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 font-bold text-xs shadow-md shadow-brand-500/20 transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Weekly Report</span>
        </Link>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No reports found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {statusFilter
                ? `No reports match the "${statusFilter}" status filter.`
                : 'You have not submitted any weekly reports yet.'}
            </p>
            <Link
              href="/reports/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Report</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Week Range</th>
                    <th className="py-3.5 px-6">Project</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Tasks Logged</th>
                    <th className="py-3.5 px-6">Submitted / Updated</th>
                    <th className="py-3.5 px-6 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredReports.map((rep) => {
                    const projectName = (typeof rep.project === 'object' && rep.project?.name) ? rep.project.name : (typeof rep.project === 'string' && rep.project ? rep.project : 'Project');
                    const canEdit = rep.status === 'DRAFT' || rep.status === 'NEEDS_CORRECTION';

                    return (
                      <tr key={rep._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
                            <span>{formatWeekRange(rep.weekStart, rep.weekEnd)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-700">{projectName}</td>
                        <td className="py-4 px-6">
                          <StatusBadge status={rep.status} />
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          <span className="font-semibold text-slate-800">{rep.tasks?.length || 0}</span> tasks
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500">
                          {formatDate(rep.submittedAt || rep.updatedAt || rep.createdAt)}
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            <Link
                              href={`/reports/${rep._id}`}
                              className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all"
                            >
                              View
                            </Link>

                            {canEdit && (
                              <Link
                                href={`/reports/${rep._id}/edit`}
                                className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all"
                              >
                                {rep.status === 'NEEDS_CORRECTION' ? 'Resubmit' : 'Edit'}
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
