import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Report } from "@/types";

export async function getReportById(id: string): Promise<Report> {
  const json = await apiRequest<ApiResponse<{ report: Report }>>(`/reports/${id}`, {
    method: "GET",
  });
  return json.data.report;
}
