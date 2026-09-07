import { api } from '@/lib/api';
import {
  ActivityItem,
  ApiResponse,
  DashboardSummary,
  MemberStatusItem,
  ProjectWorkloadItem,
  TaskTrendItem,
  TimeByTypeItem,
} from '@/types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return response.data.data;
  },

  async getTaskTrend(): Promise<TaskTrendItem[]> {
    const response = await api.get<ApiResponse<{ trend: TaskTrendItem[] }>>('/dashboard/task-trend');
    return response.data.data.trend;
  },

  async getStatusByMember(): Promise<MemberStatusItem[]> {
    const response = await api.get<ApiResponse<{ members: MemberStatusItem[] }>>('/dashboard/status-by-member');
    return response.data.data.members;
  },

  async getWorkloadByProject(): Promise<ProjectWorkloadItem[]> {
    const response = await api.get<ApiResponse<{ workload: ProjectWorkloadItem[] }>>('/dashboard/workload-by-project');
    return response.data.data.workload;
  },

  async getTimeByTaskType(): Promise<TimeByTypeItem> {
    const response = await api.get<ApiResponse<TimeByTypeItem>>('/dashboard/time-by-task-type');
    return response.data.data;
  },

  async getRecentActivity(): Promise<ActivityItem[]> {
    const response = await api.get<ApiResponse<{ activities: ActivityItem[] }>>('/dashboard/recent-activity');
    return response.data.data.activities;
  },
};
