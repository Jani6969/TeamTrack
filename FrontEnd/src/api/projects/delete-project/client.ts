import { apiRequest } from "@/api/apiClient";
import { ApiResponse } from "@/types";

export async function deleteProject(id: string): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/projects/${id}`, {
    method: "DELETE",
  });
}
