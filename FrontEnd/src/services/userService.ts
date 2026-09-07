import { api } from '@/lib/api';
import { ApiResponse, User } from '@/types';

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get<ApiResponse<{ users: User[]; count: number }>>('/users');
    return response.data.data.users;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data.data.user;
  },

  async updateUserRole(id: string, role: 'TEAM_MEMBER' | 'MANAGER'): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>(`/users/${id}/role`, { role });
    return response.data.data.user;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/users/${id}`);
  },
};
