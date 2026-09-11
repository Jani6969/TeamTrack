import { apiRequest } from "@/api/apiClient";
import { ApiResponse, User } from "@/types";

export async function getUserById(id: string): Promise<User> {
  const json = await apiRequest<ApiResponse<{ user: User }>>(`/users/${id}`, {
    method: "GET",
  });
  return json.data.user;
}
