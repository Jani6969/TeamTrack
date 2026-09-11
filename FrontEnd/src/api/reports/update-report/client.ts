import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Report } from "@/types";
import { ReportPayload } from "../types";

export async function updateReport(
  id: string,
  payload: Partial<ReportPayload>
): Promise<Report> {
  const json = await apiRequest<ApiResponse<{ report: Report }>>(`/reports/${id}`, {
    method: "PUT",
    body: payload,
  });
  return json.data.report;
}
