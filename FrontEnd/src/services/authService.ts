import { api } from '@/lib/api';
import { ApiResponse, User } from '@/types';

export interface AuthResponseData {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<AuthResponseData> {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
    return response.data.data;
  },

  async register(data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponseData> {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  },
};
