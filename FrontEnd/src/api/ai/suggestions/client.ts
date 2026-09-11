import { apiRequest } from "@/api/apiClient";

export async function fetchSuggestedPrompts(): Promise<string[]> {
  const json = await apiRequest<{
    success: boolean;
    data: { prompts: string[] };
  }>("/ai/suggestions", {
    method: "GET",
  });
  return json.data.prompts;
}
