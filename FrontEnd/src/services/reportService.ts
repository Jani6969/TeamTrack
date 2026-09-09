import { api } from '@/lib/api';
import { ApiResponse, PaginatedResponse, Report, Review } from '@/types';

export interface ReportPayload {
  weekStart: string;
  weekEnd: string;
  project: string;
  tasks: Array<{
    taskName: string;
    priority: string;
    plannedPercentage: number;
    actualPercentage: number;
    status: string;
    plannedHours: number;
    actualHours: number;
    deliverable?: string;
  }>;
  plannedTasks?: string;
  blockers?: string;
  keyBlocker?: string;
  achievements?: string;
  keyAchievement?: string;
  hoursWorked?: {
    development: number;
    testing: number;
    meetings: number;
    documentation: number;
    other: number;
  };
  notes?: string;
}

export const reportService = {
  async getMyReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Report>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Report>>>('/reports/my', { params });
    return response.data.data;
  },

  async getReportById(id: string): Promise<Report> {
    const response = await api.get<ApiResponse<{ report: Report }>>(`/reports/${id}`);
    return response.data.data.report;
  },

  async createReport(payload: ReportPayload): Promise<Report> {
    const response = await api.post<ApiResponse<{ report: Report }>>('/reports', payload);
    return response.data.data.report;
  },

  async updateReport(id: string, payload: Partial<ReportPayload>): Promise<Report> {
    const response = await api.put<ApiResponse<{ report: Report }>>(`/reports/${id}`, payload);
    return response.data.data.report;
  },

  async submitReport(id: string): Promise<Report> {
    const response = await api.post<ApiResponse<{ report: Report }>>(`/reports/${id}/submit`);
    return response.data.data.report;
  },

  async resubmitReport(id: string): Promise<Report> {
    const response = await api.post<ApiResponse<{ report: Report }>>(`/reports/${id}/resubmit`);
    return response.data.data.report;
  },

  async getReportReviews(id: string): Promise<Review[]> {
    const response = await api.get<ApiResponse<{ reviews: Review[] }>>(`/reports/${id}/reviews`);
    return response.data.data.reviews;
  },
};
