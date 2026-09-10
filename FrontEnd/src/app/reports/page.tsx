'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getMyReports } from '@/api/reports';
import { useToast } from '@/context/ToastContext';
import { Report } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatWeekRange, formatDate, getWeekBoundaries } from '@/lib/utils';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  ExternalLink,
  Edit3,
  Calendar,
  RotateCcw,
} from 'lucide-react';

export default function MyReportsPage() {
  const { error: toastError } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  // Maximum allowed date is today (cannot filter future dates)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const weekOptions = [
    { id: 'ALL', label: 'All Weeks' },
    { id: '0', label: `Current Week (${formatWeekRange(getWeekBoundaries(0).weekStart, getWeekBoundaries(0).weekEnd)})` },
    { id: '1', label: `Last Week (${formatWeekRange(getWeekBoundaries(1).weekStart, getWeekBoundaries(1).weekEnd)})` },
    { id: '2', label: `2 Weeks Ago (${formatWeekRange(getWeekBoundaries(2).weekStart, getWeekBoundaries(2).weekEnd)})` },
    { id: '3', label: `3 Weeks Ago (${formatWeekRange(getWeekBoundaries(3).weekStart, getWeekBoundaries(3).weekEnd)})` },
    { id: 'CUSTOM', label: 'Custom Dates...' },
  ];

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await getMyReports({
          page,
          limit,
          status: statusFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
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
  }, [page, statusFilter, startDate, endDate]);

  const handleWeekSelect = (weekId: string) => {
    setSelectedWeek(weekId);
    setPage(1);
    if (weekId === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (weekId === 'CUSTOM') {
      // Keep existing custom dates
    } else {
      const b = getWeekBoundaries(Number(weekId));
      setStartDate(b.weekStart);
      // Cap at today if weekEnd is in future
      const cappedEnd = b.weekEnd > todayStr ? todayStr : b.weekEnd;
      setEndDate(cappedEnd);
    }
  };

  const handleStartDateChange = (val: string) => {
    if (val && val > todayStr) {
      toastError('Future dates cannot be selected');
      return;
    }
    if (val && endDate && val > endDate) {
      toastError('Start date cannot be after end date');
      return;
    }
    setStartDate(val);
    setSelectedWeek('CUSTOM');
    setPage(1);
  };

  const handleEndDateChange = (val: string) => {
    if (val && val > todayStr) {
      toastError('Future dates cannot be selected');
      return;
    }
    if (val && startDate && val < startDate) {
      toastError('End date cannot be before start date');
      return;
    }
    setEndDate(val);
    setSelectedWeek('CUSTOM');
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSelectedWeek('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(searchTerm || statusFilter || startDate || endDate || selectedWeek !== 'ALL');

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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search bar */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports or tasks..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="NEEDS_CORRECTION">Needs Correction</option>
              <option value="APPROVED">Approved</option>
              <option value="NOT_STARTED">Not Started / Draft</option>
            </select>

            {/* Week selector */}
            <select
              value={selectedWeek}
              onChange={(e) => handleWeekSelect(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {weekOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 font-bold text-xs shadow-md shadow-brand-500/20 transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Weekly Report</span>
          </Link>
        </div>

        {/* Date range inputs */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Date Range:</span>
            <input
              type="date"
              value={startDate}
              max={endDate || todayStr}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700"
              title="Filter by Week Start Date"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              max={todayStr}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700"
              title="Filter by Week End Date"
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors ml-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="text-slate-500">
            Total: <span className="font-bold text-slate-900">{total}</span> reports
          </div>
        </div>
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
              <table className="w-full text-left text-sm min-w-[880px]">
                <thead className="bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
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
                      <tr key={rep._id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200/60 shadow-2xs">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                                {formatWeekRange(rep.weekStart, rep.weekEnd)}
                              </div>
                              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                Weekly Cycle
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50/90 text-cyan-900 border border-cyan-200/80 text-xs font-semibold shadow-2xs">
                            <FileText className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                            <span>{projectName}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <StatusBadge status={rep.status} />
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-600 font-medium">
                          <span className="font-bold text-slate-900">{rep.tasks?.length || 0}</span> tasks logged
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500 font-medium">
                          {formatDate(rep.submittedAt || rep.updatedAt || rep.createdAt)}
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            <Link
                              href={`/reports/${rep._id}`}
                              className="h-8 px-3.5 rounded-xl text-xs font-bold inline-flex items-center justify-center whitespace-nowrap bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 hover:border-brand-200 shadow-2xs transition-all"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                            </Link>

                            {canEdit && (
                              <Link
                                href={`/reports/${rep._id}/edit`}
                                className="h-8 px-3.5 rounded-xl text-xs font-bold inline-flex items-center justify-center whitespace-nowrap bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
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
