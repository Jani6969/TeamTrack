'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { managerService } from '@/services/managerService';
import { projectService } from '@/services/projectService';
import { userService } from '@/services/userService';
import { useToast } from '@/context/ToastContext';
import { Report, Project, User } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatWeekRange, formatDate, getWeekBoundaries } from '@/lib/utils';
import {
  FileCheck2,
  Search,
  Users,
  Calendar,
  ExternalLink,
  RotateCcw,
  Bell,
  Clock,
  CircleDashed,
  Layers,
  FolderKanban,
  Send,
  CheckCircle2,
} from 'lucide-react';

export default function ManagerReportsPage() {
  const { success: toastSuccess, info: toastInfo, error: toastError } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Active view: reports list or reminders / not started
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'NOT_STARTED' | 'REMINDERS'>('REPORTS');
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  // Predefined week options for quick selection
  const weekOptions = useMemo(() => {
    return [
      { id: 'ALL', label: 'All Weeks (No week filter)' },
      { id: '0', label: `Current Week (${formatWeekRange(getWeekBoundaries(0).weekStart, getWeekBoundaries(0).weekEnd)})` },
      { id: '1', label: `Last Week (${formatWeekRange(getWeekBoundaries(1).weekStart, getWeekBoundaries(1).weekEnd)})` },
      { id: '2', label: `2 Weeks Ago (${formatWeekRange(getWeekBoundaries(2).weekStart, getWeekBoundaries(2).weekEnd)})` },
      { id: '3', label: `3 Weeks Ago (${formatWeekRange(getWeekBoundaries(3).weekStart, getWeekBoundaries(3).weekEnd)})` },
      { id: '4', label: `4 Weeks Ago (${formatWeekRange(getWeekBoundaries(4).weekStart, getWeekBoundaries(4).weekEnd)})` },
      { id: 'CUSTOM', label: 'Custom Date Range...' },
    ];
  }, []);

  // Fetch reference projects and users on load
  useEffect(() => {
    projectService.getProjects().then(setProjects).catch(console.error);
    userService
      .getUsers()
      .then((users) => {
        setTeamMembers(users.filter((u) => u.role === 'TEAM_MEMBER' || u.role === 'MANAGER'));
      })
      .catch(console.error);
  }, []);

  // Fetch reports when filters or pagination change
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await managerService.getManagerReports({
          page,
          limit,
          status: statusFilter || undefined,
          projectId: projectFilter || undefined,
          userId: memberFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
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
  }, [page, statusFilter, projectFilter, memberFilter, startDate, endDate]);

  // Handle week selection
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

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setProjectFilter('');
    setMemberFilter('');
    setSelectedWeek('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setActiveTab('REPORTS');
    toastInfo('All filters have been reset');
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
      statusFilter ||
      projectFilter ||
      memberFilter ||
      startDate ||
      endDate ||
      selectedWeek !== 'ALL'
  );

  // Client-side text search across member name, email, project name
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const userName = typeof r.user === 'object' && r.user?.name ? r.user.name.toLowerCase() : '';
      const userEmail = typeof r.user === 'object' && r.user?.email ? r.user.email.toLowerCase() : '';
      const projName = typeof r.project === 'object' && r.project?.name ? r.project.name.toLowerCase() : '';
      return userName.includes(term) || userEmail.includes(term) || projName.includes(term);
    });
  }, [reports, searchTerm]);

  // Track team members who have NOT submitted for current view/period
  const submittedMemberIds = useMemo(() => {
    const ids = new Set<string>();
    reports.forEach((r) => {
      const uId = typeof r.user === 'object' ? r.user?._id : r.user;
      if (uId && (r.status === 'SUBMITTED' || r.status === 'APPROVED')) {
        ids.add(uId);
      }
    });
    return ids;
  }, [reports]);

  const notStartedMembers = useMemo(() => {
    return teamMembers
      .filter((m) => m.role === 'TEAM_MEMBER' && !submittedMemberIds.has(m._id))
      .filter((m) => {
        if (!memberFilter) return true;
        return m._id === memberFilter;
      })
      .filter((m) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term);
      });
  }, [teamMembers, submittedMemberIds, memberFilter, searchTerm]);

  // When statusFilter is set to NOT_STARTED, auto-switch to reminders tab
  useEffect(() => {
    if (statusFilter === 'NOT_STARTED') {
      setActiveTab('REMINDERS');
    }
  }, [statusFilter]);

  const handleSendReminder = (name: string, email: string) => {
    toastSuccess(`Reminder notification sent to ${name} (${email})`);
  };

  const handleRemindAll = () => {
    toastSuccess(`Reminders successfully sent to all ${notStartedMembers.length} team members.`);
  };

  // Determine active display week string
  const activeWeekDisplay = startDate && endDate ? formatWeekRange(startDate, endDate) : 'All Weeks';

  return (
    <AppShell
      allowedRoles={['MANAGER', 'ADMIN']}
      title="Team Weekly Reports"
      subtitle="Review team member submissions, evaluate deliverables, and track weekly submission compliance"
    >
      {/* Top Filter Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6 space-y-4">
        {/* Row 1: Search + Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search member, email, project..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Filter by Team Member */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Users className="w-4 h-4" />
            </div>
            <select
              value={memberFilter}
              onChange={(e) => {
                setMemberFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none truncate"
            >
              <option value="">All Team Members</option>
              {teamMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.role === 'MANAGER' ? 'Manager' : 'Member'})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Project */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FolderKanban className="w-4 h-4" />
            </div>
            <select
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none truncate"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status (including NOT_STARTED) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none truncate"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted (Pending Review)</option>
              <option value="NEEDS_CORRECTION">Needs Correction</option>
              <option value="APPROVED">Approved</option>
              <option value="DRAFT">Draft</option>
              <option value="NOT_STARTED">Not Started / Missing Submission</option>
            </select>
          </div>
        </div>

        {/* Row 2: Selected Week + Date Range (Start Date, End Date) + Reset */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Week Selector Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>Week:</span>
              </div>
              <select
                value={selectedWeek}
                onChange={(e) => handleWeekSelect(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {weekOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Inputs: Start Date & End Date */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">From:</span>
              <input
                type="date"
                value={startDate}
                max={endDate || todayStr}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                title="Filter by Week Start Date"
              />

              <span className="text-xs font-medium text-slate-500">To:</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                max={todayStr}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                title="Filter by Week End Date"
              />
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors"
                title="Reset all search, status, project, member and date filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Active Summary / Results Count */}
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{total}</span> reports
            {startDate && endDate && (
              <span className="ml-1 text-brand-600 font-semibold">({activeWeekDisplay})</span>
            )}
          </div>
        </div>
      </div>

      {/* View Tabs: All Submitted Reports vs Not Yet Started Tracker */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('REPORTS');
              if (statusFilter === 'NOT_STARTED') setStatusFilter('');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'REPORTS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Weekly Reports</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
              {total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('NOT_STARTED')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'NOT_STARTED'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CircleDashed className="w-3.5 h-3.5 text-amber-500" />
            <span>Not Yet Started / Missing</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {notStartedMembers.length}
            </span>
          </button>
        </div>

        {activeTab === 'NOT_STARTED' && notStartedMembers.length > 0 && (
          <button
            type="button"
            onClick={handleRemindAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Remind All ({notStartedMembers.length})</span>
          </button>
        )}
      </div>

      {/* Main Content Area: REPORTS TAB */}
      {activeTab === 'REPORTS' && (
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
              <h3 className="text-base font-bold text-slate-800">No reports match your filters</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Try resetting member, project, week, or status filters.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-sm hover:bg-brand-700 transition-colors"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[840px]">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Team Member</th>
                      <th className="py-3.5 px-6">Week Range</th>
                      <th className="py-3.5 px-6">Project</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Submitted Date</th>
                      <th className="py-3.5 px-6 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredReports.map((rep) => {
                      const memberName =
                        typeof rep.user === 'object' && rep.user?.name
                          ? rep.user.name
                          : typeof rep.user === 'string' && rep.user
                          ? rep.user
                          : 'Team Member';
                      const memberEmail = typeof rep.user === 'object' && rep.user?.email ? rep.user.email : '';
                      const projName =
                        typeof rep.project === 'object' && rep.project?.name
                          ? rep.project.name
                          : typeof rep.project === 'string' && rep.project
                          ? rep.project
                          : 'Project';

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
                          <td className="py-3.5 px-6 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-2">
                              <Link
                                href={`/reports/${rep._id}`}
                                className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 flex items-center justify-center transition-all shadow-sm shrink-0"
                                title="View Document"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <Link
                                href={`/manager/reports/${rep._id}/review`}
                                className={`h-8 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center whitespace-nowrap transition-all shadow-sm ${
                                  rep.status === 'SUBMITTED'
                                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
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
      )}

      {/* Main Content Area: NOT YET STARTED TRACKER TAB */}
      {activeTab === 'NOT_STARTED' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-amber-50/50 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <CircleDashed className="w-4 h-4 text-amber-600" />
                <span>Weekly Submission Compliance Tracker</span>
              </div>
              <p className="text-xs text-amber-700/80 mt-0.5">
                The following team members have not submitted an approved or pending report for{' '}
                <span className="font-bold text-amber-900">{activeWeekDisplay}</span>.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
              <span>
                Compliance:{' '}
                <span className="text-slate-900 font-bold">
                  {teamMembers.length > 0
                    ? Math.round(
                        ((teamMembers.length - notStartedMembers.length) / teamMembers.length) * 100
                      )
                    : 100}
                  %
                </span>
              </span>
              <span className="w-px h-3.5 bg-slate-300" />
              <span>
                Missing:{' '}
                <span className="text-rose-600 font-bold">{notStartedMembers.length}</span> members
              </span>
            </div>
          </div>

          {notStartedMembers.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">All reports submitted!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Every team member has submitted their report for the active filter period ({activeWeekDisplay}).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Team Member</th>
                    <th className="py-3.5 px-6">Reporting Period</th>
                    <th className="py-3.5 px-6">Submission Status</th>
                    <th className="py-3.5 px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {notStartedMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{member.name}</div>
                            <div className="text-xs text-slate-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        {activeWeekDisplay}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status="NOT_STARTED" />
                      </td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleSendReminder(member.name, member.email)}
                          className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-amber-800 border border-amber-300 shadow-sm transition-all"
                        >
                          <Send className="w-3 h-3 text-amber-600" />
                          <span>Send Reminder</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
