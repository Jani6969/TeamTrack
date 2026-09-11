import { apiRequest } from "@/api/apiClient";
import { ApiResponse, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export async function loginUser(credentials: LoginPayload): Promise<AuthResponseData> {
  const json = await apiRequest<ApiResponse<AuthResponseData>>("/auth/login", {
    method: "POST",
    body: credentials,
  });
  return json.data;
}
