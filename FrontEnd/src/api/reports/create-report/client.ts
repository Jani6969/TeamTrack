import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Report } from "@/types";
import { ReportPayload } from "../types";

export async function createReport(payload: ReportPayload): Promise<Report> {
  const json = await apiRequest<ApiResponse<{ report: Report }>>("/reports", {
    method: "POST",
    body: payload,
  });
  return json.data.report;
}
