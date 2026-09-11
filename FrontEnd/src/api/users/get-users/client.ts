import { apiRequest } from "@/api/apiClient";
import { ApiResponse, User } from "@/types";

export async function getUsers(): Promise<User[]> {
  const json = await apiRequest<ApiResponse<{ users: User[]; count: number }>>(
    "/users",
    {
      method: "GET",
    }
  );
  return json.data.users;
}
