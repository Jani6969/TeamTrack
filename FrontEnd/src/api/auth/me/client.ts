import { apiRequest } from "@/api/apiClient";
import { ApiResponse, User } from "@/types";

export async function getMe(token?: string): Promise<User> {
  const json = await apiRequest<ApiResponse<{ user: User }>>("/auth/me", {
    method: "GET",
    token,
  });
  return json.data.user;
}
