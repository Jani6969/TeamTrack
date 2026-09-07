import { api } from '@/lib/api';
import { ApiResponse, Project } from '@/types';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<ApiResponse<{ projects: Project[]; count: number }>>('/projects');
    return response.data.data.projects;
  },

  async createProject(payload: { name: string; description?: string; isActive?: boolean }): Promise<Project> {
    const response = await api.post<ApiResponse<{ project: Project }>>('/projects', payload);
    return response.data.data.project;
  },

  async updateProject(id: string, payload: { name?: string; description?: string; isActive?: boolean }): Promise<Project> {
    const response = await api.put<ApiResponse<{ project: Project }>>(`/projects/${id}`, payload);
    return response.data.data.project;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/projects/${id}`);
  },
};
