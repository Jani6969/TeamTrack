import { apiRequest } from "@/api/apiClient";
import { ApiResponse, DashboardSummary } from "@/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const json = await apiRequest<ApiResponse<DashboardSummary>>("/dashboard/summary", {
    method: "GET",
  });
  return json.data;
}
