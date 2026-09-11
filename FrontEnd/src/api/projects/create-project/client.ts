import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Project } from "@/types";

export interface CreateProjectPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const json = await apiRequest<ApiResponse<{ project: Project }>>("/projects", {
    method: "POST",
    body: payload,
  });
  return json.data.project;
}
