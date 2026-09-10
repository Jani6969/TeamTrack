import { apiRequest } from "@/api/apiClient";
import { ActivityItem, ApiResponse } from "@/types";

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const json = await apiRequest<ApiResponse<{ activities: ActivityItem[] }>>(
    "/dashboard/recent-activity",
    {
      method: "GET",
    }
  );
  return json.data.activities;
}
