import { api } from '@/lib/api';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp?: string;
}

export interface ChatResponseData {
  reply: string;
  model: string;
}

export interface TeamSummaryData {
  summary: string;
  generatedAt: string;
  model: string;
}

/**
 * Send a message to TeamTrack AI Copilot with multi-turn conversation history
 */
export async function sendAIChat(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ChatResponseData> {
  const response = await api.post<{ success: boolean; data: ChatResponseData }>(
    '/ai/chat',
    {
      message,
      history,
    },
    {
      timeout: 45000,
    }
  );
  return response.data.data;
}

/**
 * Request an AI Executive Team Summary (Manager only)
 */
export async function fetchAITeamSummary(): Promise<TeamSummaryData> {
  const response = await api.post<{ success: boolean; data: TeamSummaryData }>(
    '/ai/summary',
    {},
    {
      timeout: 45000,
    }
  );
  return response.data.data;
}

/**
 * Fetch dynamic suggested queries based on user role and system data
 */
export async function fetchSuggestedPrompts(): Promise<string[]> {
  const response = await api.get<{ success: boolean; data: { prompts: string[] } }>(
    '/ai/suggestions'
  );
  return response.data.data.prompts;
}
