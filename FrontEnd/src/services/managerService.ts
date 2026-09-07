import { api } from '@/lib/api';
import { ApiResponse, PaginatedResponse, Report, Review } from '@/types';

export interface ManagerReportFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export const managerService = {
  async getManagerReports(params?: ManagerReportFilterParams): Promise<PaginatedResponse<Report>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Report>>>('/manager/reports', { params });
    return response.data.data;
  },

  async getManagerReportById(id: string): Promise<Report> {
    const response = await api.get<ApiResponse<{ report: Report }>>(`/manager/reports/${id}`);
    return response.data.data.report;
  },

  async approveReport(id: string, comment?: string): Promise<{ report: Report; review: Review }> {
    const response = await api.post<ApiResponse<{ report: Report; review: Review }>>(
      `/manager/reports/${id}/approve`,
      { comment }
    );
    return response.data.data;
  },

  async requestCorrection(id: string, comment: string): Promise<{ report: Report; review: Review }> {
    const response = await api.post<ApiResponse<{ report: Report; review: Review }>>(
      `/manager/reports/${id}/request-correction`,
      { comment }
    );
    return response.data.data;
  },
};
