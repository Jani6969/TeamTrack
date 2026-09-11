import { apiRequest } from "@/api/apiClient";
import { ApiResponse, Review } from "@/types";

export async function getReportReviews(id: string): Promise<Review[]> {
  const json = await apiRequest<ApiResponse<{ reviews: Review[] }>>(
    `/reports/${id}/reviews`,
    {
      method: "GET",
    }
  );
  return json.data.reviews;
}
