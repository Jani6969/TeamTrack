import { apiRequest } from "@/api/apiClient";
import { ApiResponse } from "@/types";

export async function deleteUser(id: string): Promise<void> {
  await apiRequest<ApiResponse<null>>(`/users/${id}`, {
    method: "DELETE",
  });
}
