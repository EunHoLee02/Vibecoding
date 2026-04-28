import { getApiBaseUrl, parseApiResponse } from "@/lib/api/shared";

export async function apiClient<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  return parseApiResponse<T>(response);
}
