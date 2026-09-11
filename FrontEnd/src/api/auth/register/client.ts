import { apiRequest } from "@/api/apiClient";
import { ApiResponse, User } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface RegisterResponseData {
  user: User;
  token: string;
}

export async function registerUser(data: RegisterPayload): Promise<RegisterResponseData> {
  const json = await apiRequest<ApiResponse<RegisterResponseData>>("/auth/register", {
    method: "POST",
    body: data,
  });
  return json.data;
}
