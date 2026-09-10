import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Report } from "@/types";

export async function submitReport(id: string): Promise<Report> {
  const json = await apiRequest<ApiResponse<{ report: Report }>>(`/reports/${id}/submit`, {
    method: "POST",
  });
  return json.data.report;
}
