import { cookies } from "next/headers";

import { getApiBaseUrl, parseApiResponse } from "@/lib/api/shared";

export async function serverApi<T>(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: init.cache ?? "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(init.headers ?? {}),
    },
  });

  return parseApiResponse<T>(response);
}
