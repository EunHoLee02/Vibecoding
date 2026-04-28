import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppApiError } from "@/lib/api/shared";
import { serverApi } from "@/lib/api/server";
import type { User } from "@/lib/types";
import { normalizeReturnTo } from "@/lib/utils";

export async function getCurrentUser() {
  try {
    return await serverApi<User>("/api/v1/auth/me");
  } catch (error) {
    if (error instanceof AppApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (user) {
    return user;
  }

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "/app";
  const search = headerStore.get("x-search") ?? "";
  const returnTo = normalizeReturnTo(`${pathname}${search}`);

  redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
}

export async function redirectIfAuthenticated(returnTo?: string | null) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  redirect(normalizeReturnTo(returnTo));
}
