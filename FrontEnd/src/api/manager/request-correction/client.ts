import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Report, Review } from "@/types";

export async function requestCorrection(
  id: string,
  comment: string
): Promise<{ report: Report; review: Review }> {
  const json = await apiRequest<ApiResponse<{ report: Report; review: Review }>>(
    `/manager/reports/${id}/request-correction`,
    {
      method: "POST",
      body: { comment },
    }
  );
  return json.data;
}
