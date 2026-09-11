import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Project } from "@/types";

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export async function updateProject(
  id: string,
  payload: UpdateProjectPayload
): Promise<Project> {
  const json = await apiRequest<ApiResponse<{ project: Project }>>(`/projects/${id}`, {
    method: "PUT",
    body: payload,
  });
  return json.data.project;
}
