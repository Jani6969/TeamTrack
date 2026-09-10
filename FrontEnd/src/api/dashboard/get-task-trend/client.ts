import { apiRequest } from "@/api/apiClient";
import { ApiResponse, TaskTrendItem } from "@/types";

export async function getTaskTrend(): Promise<TaskTrendItem[]> {
  const json = await apiRequest<ApiResponse<{ trend: TaskTrendItem[] }>>(
    "/dashboard/task-trend",
    {
      method: "GET",
    }
  );
  return json.data.trend;
}
