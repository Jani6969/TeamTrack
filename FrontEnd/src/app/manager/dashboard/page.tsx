'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  getDashboardSummary,
  getTaskTrend,
  getStatusByMember,
  getWorkloadByProject,
  getTimeByTaskType,
  getRecentActivity,
} from '@/api/dashboard';
import {
  ActivityItem,
  DashboardSummary,
  MemberStatusItem,
  ProjectWorkloadItem,
  TaskTrendItem,
  TimeByTypeItem,
} from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import { CardSkeleton, ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import { formatDateTime } from '@/lib/utils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  FolderKanban,
  Users,
  Activity,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Zap,
  MessageSquare,
} from 'lucide-react';

// Custom dark glass tooltip for modern charts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl border border-slate-700/60 shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-300 border-b border-slate-700/50 pb-1 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-300 text-[11px]">{entry.name}:</span>
            </div>
            <span className="font-bold text-white text-[11px]">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ManagerDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [taskTrend, setTaskTrend] = useState<TaskTrendItem[]>([]);
  const [memberStatus, setMemberStatus] = useState<MemberStatusItem[]>([]);
  const [workload, setWorkload] = useState<ProjectWorkloadItem[]>([]);
  const [timeByType, setTimeByType] = useState<TimeByTypeItem | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const [sum, trend, members, work, time, acts] = await Promise.all([
        getDashboardSummary(),
        getTaskTrend(),
        getStatusByMember(),
        getWorkloadByProject(),
        getTimeByTaskType(),
        getRecentActivity(),
      ]);

      setSummary(sum);
      setTaskTrend(trend || []);
      setMemberStatus(members || []);
      setWorkload(work || []);
      setTimeByType(time || null);
      setActivities(acts || []);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const triggerAICopilot = (prompt?: string, tab: 'chat' | 'summary' = 'chat') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('teamtrack:open-ai', {
          detail: { prompt, tab },
        })
      );
    }
  };

  // Pie chart data for time by category
  const pieData = timeByType
    ? [
        { name: 'Development', value: timeByType.development, color: '#4f46e5' },
        { name: 'Testing & QA', value: timeByType.testing, color: '#06b6d4' },
        { name: 'Meetings', value: timeByType.meetings, color: '#f59e0b' },
        { name: 'Documentation', value: timeByType.documentation, color: '#8b5cf6' },
        { name: 'Other', value: timeByType.other, color: '#64748b' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <AppShell
      allowedRoles={['MANAGER', 'ADMIN']}
      title="Overview"
    >
      {/* Top action bar & Live Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Aggregated MongoDB Telemetry Pipeline</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">Live Team View</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Metrics'}</span>
          </button>
        </div>
      </div>

      {/* 1. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Submitted"
              value={summary?.totalReportsSubmitted ?? 0}
              icon={<FileCheck2 className="w-4 h-4" />}
              color="indigo"
            />
            <StatCard
              title="Compliance Rate"
              value={`${summary?.submissionComplianceRate ?? 100}%`}
              icon={<TrendingUp className="w-4 h-4" />}
              color="emerald"
            />
            <StatCard
              title="Pending Review"
              value={summary?.pendingReports ?? 0}
              icon={<Clock className="w-4 h-4" />}
              color={summary?.pendingReports ? 'amber' : 'blue'}
            />
            <StatCard
              title="Needs Correction"
              value={summary?.needsCorrection ?? 0}
              icon={<AlertTriangle className="w-4 h-4" />}
              color={summary?.needsCorrection ? 'rose' : 'blue'}
            />
            <StatCard
              title="Approved"
              value={summary?.approvedReports ?? 0}
              icon={<CheckCircle2 className="w-4 h-4" />}
              color="emerald"
            />
            <StatCard
              title="Open Blockers"
              value={summary?.openBlockers ?? 0}
              icon={<AlertTriangle className="w-4 h-4" />}
              color={summary?.openBlockers ? 'rose' : 'blue'}
            />
          </>
        )}
      </div>

      {/* 2. Manager Quick-Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <Link
          href="/manager/reports?status=SUBMITTED"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Review Queue
              </div>
              <div className="text-[11px] text-slate-500">
                {summary?.pendingReports ?? 0} submissions pending
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/projects"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                Team Projects
              </div>
              <div className="text-[11px] text-slate-500">Manage allocations & deadlines</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/manager/members"
          className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-cyan-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                Team Roster
              </div>
              <div className="text-[11px] text-slate-500">Inspect individual member velocity</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <button
          onClick={() => triggerAICopilot(undefined, 'summary')}
          className="group p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white hover:shadow-lg hover:shadow-indigo-950/20 transition-all flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                AI Executive Summary
              </div>
              <div className="text-[11px] text-slate-300">Generate cross-sprint report</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 transition-colors" />
        </button>
      </div>

      {/* 3. AI Copilot Compact Command Bar */}
      <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 mb-8 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-tight">AI Copilot</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Ask anything about sprints, blockers, or workload:</span>
          </div>
        </div>

        {/* Quick Action Prompt Chips */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            onClick={() => triggerAICopilot('Summarize this week team achievements and completed milestones')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-semibold text-slate-200 hover:text-white transition-all"
          >
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Highlights</span>
          </button>

          <button
            onClick={() => triggerAICopilot('Which projects have open blockers or impediments, and what is the resolution guidance?')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-semibold text-slate-200 hover:text-white transition-all"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
            <span>Blockers</span>
          </button>

          <button
            onClick={() => triggerAICopilot('Analyze workload distribution and identify any overloaded team members')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-[11px] font-semibold text-slate-200 hover:text-white transition-all"
          >
            <Users className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Workload</span>
          </button>

          <button
            onClick={() => triggerAICopilot(undefined, 'chat')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold shadow-sm transition-all"
          >
            <MessageSquare className="w-3 h-3 shrink-0" />
            <span>Ask Copilot</span>
          </button>
        </div>
      </div>

      {/* 4. Telemetry Visualizations & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Tasks Completed Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Completion Velocity</h3>
              <p className="text-xs text-slate-400">Completed vs In-Progress weekly trajectory</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
              Sprint Trend
            </span>
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : taskTrend.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No task trend data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inProgress"
                    name="In Progress"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#6366f1' }}
                    activeDot={{ r: 5, fill: '#fff', stroke: '#6366f1' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="notStarted"
                    name="Not Started"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Report Status by Member */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Report Status by Team Member</h3>
              <p className="text-xs text-slate-400">Approved, submitted, and correction breakdown per engineer</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : memberStatus.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No team member status data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="submitted" name="Submitted" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="needsCorrection" name="Correction" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 3: Workload by Project */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Workload Allocation</h3>
              <p className="text-xs text-slate-400">Total logged hours & task volume across active projects</p>
            </div>
            <FolderKanban className="w-4 h-4 text-slate-400" />
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : workload.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No project workload data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={workload}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis dataKey="projectName" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={100} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="totalHours" name="Hours Logged" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="totalTasks" name="Tasks Logged" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 4: Time Spent by Task Type */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Time Allocation by Category</h3>
              <p className="text-xs text-slate-400">Split across Dev, QA, Meetings, and Docs</p>
            </div>
            <div className="text-xs font-black text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              {timeByType?.total || 0} Total Hours
            </div>
          </div>

          {loading ? (
            <ChartSkeleton />
          ) : pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No time breakdown data available
            </div>
          ) : (
            <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-2.5 text-xs sm:pl-6 mt-4 sm:mt-0">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium">{item.name}:</span>
                    <span className="font-bold text-slate-900">{item.value}h</span>
                    <span className="text-[11px] text-slate-400">
                      ({Math.round((item.value / (timeByType?.total || 1)) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Chronological Team Activity Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Team Review Activity Feed</h3>
              <p className="text-xs text-slate-400">Live chronological audit trail of approvals and change requests</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">{activities.length} Recorded Actions</span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-400 text-xs">Loading activity telemetry...</div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs italic">
            No recent review actions logged in this period.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Status Dot */}
                <div
                  className={`absolute -left-[23px] top-2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-2 ${
                    act.action === 'APPROVED' ? 'bg-emerald-500 ring-emerald-100' : 'bg-amber-500 ring-amber-100'
                  }`}
                />

                <div className="bg-slate-50/80 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-1.5">
                    <div className="font-semibold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span className="text-brand-700 font-bold">{act.reviewer}</span>
                      <span className="text-slate-500 font-normal">
                        {act.action === 'APPROVED' ? 'approved report for' : 'requested revisions from'}
                      </span>
                      <span className="text-slate-900 font-bold">{act.reportOwner}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-medium shrink-0">
                      {formatDateTime(act.createdAt)}
                    </span>
                  </div>

                  {act.comment && (
                    <div className="mt-2.5 p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed shadow-sm">
                      <p className="italic text-slate-600">&ldquo;{act.comment}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
