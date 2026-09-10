import { apiRequest } from "@/api/apiClient";
import { ApiResponse, PaginatedResponse, Report } from "@/types";
import { ManagerReportFilterParams } from "../types";

export async function getManagerReports(
  params?: ManagerReportFilterParams
): Promise<PaginatedResponse<Report>> {
  const json = await apiRequest<ApiResponse<PaginatedResponse<Report>>>(
    "/manager/reports",
    {
      method: "GET",
      params: params as Record<string, unknown>,
    }
  );
  return json.data;
}
