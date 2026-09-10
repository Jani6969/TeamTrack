'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

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
      title="Engineering Manager Dashboard"
      subtitle="Team performance telemetry, submission compliance, and workload distribution"
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-xs text-slate-500 font-medium">
          Real-time metrics aggregated directly via MongoDB pipelines
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* 1. Summary KPI Cards (Prompt Section 13) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Submitted"
              value={summary?.totalReportsSubmitted ?? 0}
              subtitle="All weekly submissions"
              icon={<FileCheck2 className="w-4 h-4" />}
              color="indigo"
            />
            <StatCard
              title="Compliance Rate"
              value={`${summary?.submissionComplianceRate ?? 100}%`}
              subtitle="Submissions vs drafts"
              icon={<TrendingUp className="w-4 h-4" />}
              color="emerald"
              trend={{ value: 'Target 80%+', isPositive: (summary?.submissionComplianceRate ?? 100) >= 80 }}
            />
            <StatCard
              title="Pending Review"
              value={summary?.pendingReports ?? 0}
              subtitle="Awaiting manager sign-off"
              icon={<Clock className="w-4 h-4" />}
              color={summary?.pendingReports ? 'amber' : 'blue'}
            />
            <StatCard
              title="Needs Correction"
              value={summary?.needsCorrection ?? 0}
              subtitle="Sent back for revisions"
              icon={<AlertTriangle className="w-4 h-4" />}
              color={summary?.needsCorrection ? 'rose' : 'blue'}
            />
            <StatCard
              title="Approved"
              value={summary?.approvedReports ?? 0}
              subtitle="Verified deliverables"
              icon={<CheckCircle2 className="w-4 h-4" />}
              color="emerald"
            />
            <StatCard
              title="Open Blockers"
              value={summary?.openBlockers ?? 0}
              subtitle="Reported impediments"
              icon={<AlertTriangle className="w-4 h-4" />}
              color={summary?.openBlockers ? 'rose' : 'blue'}
            />
          </>
        )}
      </div>

      {/* AI Team Intelligence Assistant Quick Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl p-5 mb-8 text-white shadow-lg border border-indigo-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-brand-500/20">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">TeamTrack AI Copilot & Executive Intelligence</h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Ask questions about sprint accomplishments, query developer blockers in real time, or generate an automated capacity and risk assessment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 hidden lg:inline">
            Click floating button on bottom-right or ask directly ↘
          </span>
        </div>
      </div>

      {/* 2. Charts Section (Prompt Section 15) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Chart 1: Tasks Completed Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Completion Trend</h3>
              <p className="text-xs text-slate-400">Completed vs In-Progress tasks over time</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700">
              Weekly
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inProgress"
                    name="In Progress"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="notStarted"
                    name="Not Started"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Report Status by Member */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Report Status by Team Member</h3>
              <p className="text-xs text-slate-400">Approved, submitted, and correction breakdown per member</p>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="submitted" name="Submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="needsCorrection" name="Correction" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 3: Workload by Project */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Workload by Project</h3>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="totalHours" name="Hours Logged" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="totalTasks" name="Tasks Logged" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 4: Time Spent by Task Type */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Time Spent by Task Type</h3>
              <p className="text-xs text-slate-400">Category split: dev, testing, meetings, docs</p>
            </div>
            <div className="text-xs font-black text-brand-600">
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
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-2 text-xs sm:pl-6 mt-4 sm:mt-0">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium">{item.name}:</span>
                    <span className="font-bold text-slate-900">{item.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Activity Feed (Prompt Section 15) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Team Activity Feed</h3>
            <p className="text-xs text-slate-400">Chronological timeline of reviews, approvals, and report corrections</p>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-400 text-xs">Loading activity feed...</div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No recent review actions logged yet.</p>
        ) : (
          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activities.map((act) => (
              <div key={act.id} className="relative">
                {/* Dot */}
                <div
                  className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                    act.action === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
                    <div className="font-semibold text-slate-900">
                      <span className="text-brand-700 font-bold">{act.reviewer}</span>{' '}
                      {act.action === 'APPROVED' ? 'approved report for' : 'requested changes from'}{' '}
                      <span className="text-slate-800 font-bold">{act.reportOwner}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{formatDateTime(act.createdAt)}</span>
                  </div>

                  {act.comment && (
                    <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                      &ldquo;{act.comment}&rdquo;
                    </p>
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
