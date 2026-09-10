import { apiRequest } from "@/api/apiClient";
import { ApiResponse, MemberStatusItem } from "@/types";

export async function getStatusByMember(): Promise<MemberStatusItem[]> {
  const json = await apiRequest<ApiResponse<{ members: MemberStatusItem[] }>>(
    "/dashboard/status-by-member",
    {
      method: "GET",
    }
  );
  return json.data.members;
}
