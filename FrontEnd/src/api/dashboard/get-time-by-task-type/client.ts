import { apiRequest } from "@/api/apiClient";
import { ApiResponse, TimeByTypeItem } from "@/types";

export async function getTimeByTaskType(): Promise<TimeByTypeItem> {
  const json = await apiRequest<ApiResponse<TimeByTypeItem>>(
    "/dashboard/time-by-task-type",
    {
      method: "GET",
    }
  );
  return json.data;
}
