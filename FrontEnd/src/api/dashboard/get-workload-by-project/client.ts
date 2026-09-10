import { apiRequest } from "@/api/apiClient";
import { ApiResponse, ProjectWorkloadItem } from "@/types";

export async function getWorkloadByProject(): Promise<ProjectWorkloadItem[]> {
  const json = await apiRequest<ApiResponse<{ workload: ProjectWorkloadItem[] }>>(
    "/dashboard/workload-by-project",
    {
      method: "GET",
    }
  );
  return json.data.workload;
}
