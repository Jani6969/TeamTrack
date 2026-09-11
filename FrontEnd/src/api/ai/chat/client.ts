import { apiRequest } from "@/api/apiClient";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp?: string;
}

export interface ChatResponseData {
  reply: string;
  model: string;
}

export async function sendAIChat(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<ChatResponseData> {
  const json = await apiRequest<{ success: boolean; data: ChatResponseData }>("/ai/chat", {
    method: "POST",
    body: {
      message,
      history,
    },
    timeout: 45000,
  });
  return json.data;
}
