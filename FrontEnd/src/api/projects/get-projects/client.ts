import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Project } from "@/types";

export async function getProjects(): Promise<Project[]> {
  const json = await apiRequest<ApiResponse<{ projects: Project[]; count: number }>>(
    "/projects",
    {
      method: "GET",
    }
  );
  return json.data.projects;
}
