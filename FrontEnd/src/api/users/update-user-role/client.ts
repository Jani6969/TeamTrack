import { apiRequest } from "@/api/apiClient";
import { ApiResponse, User } from "@/types";

export async function updateUserRole(
  id: string,
  role: "TEAM_MEMBER" | "MANAGER"
): Promise<User> {
  const json = await apiRequest<ApiResponse<{ user: User }>>(`/users/${id}/role`, {
    method: "PUT",
    body: { role },
  });
  return json.data.user;
}
