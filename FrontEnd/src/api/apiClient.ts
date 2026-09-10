import axios from "axios";

// Direct backend endpoint
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
  params?: Record<string, unknown>;
  baseURL?: string;
  timeout?: number;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    token,
    body,
    params,
    baseURL = API_BASE_URL,
    timeout = 15000,
  } = options;

  const url = `${baseURL}${path}`;

  // Automatically check localStorage for JWT token in client environment if not provided
  let resolvedToken = token;
  if (!resolvedToken && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("token");
      if (stored) resolvedToken = stored;
    } catch {
      // ignore localStorage read error
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
  };

  try {
    const res = await axios<T>({
      url,
      method,
      headers,
      data: body,
      params,
      timeout,
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      let message = `Request failed with status ${status}`;
      const errData = error.response?.data;

      if (errData && typeof errData === "object") {
        const record = errData as Record<string, unknown>;
        if (record.errors && Array.isArray(record.errors) && record.errors.length > 0) {
          const firstErr = record.errors[0];
          if (typeof firstErr === "object" && firstErr && "message" in firstErr) {
            message = String((firstErr as { message: string }).message);
          } else {
            message = record.errors.map((e) => String(e)).join(", ");
          }
        } else {
          const candidate =
            record.errorMessage ??
            record.message ??
            record.title ??
            record.error;
          if (typeof candidate === "string" && candidate.trim()) {
            message = candidate;
          }
        }
      } else if (typeof errData === "string" && errData.trim()) {
        message = errData;
      } else if (error.message) {
        message = error.message;
      }

      // Handle 401 unauthenticated redirect if in browser
      if (
        status === 401 &&
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch {
          // ignore
        }
        window.location.href = "/login?session=expired";
      }

      throw new ApiError(message, status);
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new ApiError("An unexpected network error occurred.", 500);
  }
}
