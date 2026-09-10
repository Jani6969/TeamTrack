import { apiRequest } from "@/api/apiClient";

export interface TeamSummaryData {
  summary: string;
  generatedAt: string;
  model: string;
}

export async function fetchAITeamSummary(): Promise<TeamSummaryData> {
  const json = await apiRequest<{ success: boolean; data: TeamSummaryData }>("/ai/summary", {
    method: "POST",
    body: {},
    timeout: 45000,
  });
  return json.data;
}
