import { apiRequest } from "@/api/apiClient";
import { ApiResponse, PaginatedResponse, Report } from "@/types";
import { ReportFilterParams } from "../types";

export async function getMyReports(
  params?: ReportFilterParams
): Promise<PaginatedResponse<Report>> {
  const json = await apiRequest<ApiResponse<PaginatedResponse<Report>>>(
    "/reports/my",
    {
      method: "GET",
      params: params as Record<string, unknown>,
    }
  );
  return json.data;
}
