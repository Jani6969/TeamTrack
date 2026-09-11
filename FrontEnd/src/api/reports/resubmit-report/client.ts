import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Report } from "@/types";

export async function resubmitReport(id: string): Promise<Report> {
  const json = await apiRequest<ApiResponse<{ report: Report }>>(`/reports/${id}/resubmit`, {
    method: "POST",
  });
  return json.data.report;
}
