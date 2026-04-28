import type { ApiEnvelope, ApiFailure } from "@/lib/types";

export class AppApiError extends Error {
  status: number;
  code: string;
  detail?: Record<string, unknown>;
  requestId?: string | null;

  constructor(
    status: number,
    code: string,
    message: string,
    detail?: Record<string, unknown>,
    requestId?: string | null,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.requestId = requestId;
  }
}

export function getApiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000"
  );
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | ApiFailure
    | null;

  if (!response.ok || !json || json.success === false) {
    const failure = json as ApiFailure | null;

    throw new AppApiError(
      response.status,
      failure?.code ?? "INTERNAL_ERROR",
      failure?.message ?? "요청 처리 중 오류가 발생했습니다.",
      failure?.detail,
      failure?.request_id,
    );
  }

  return json.data;
}
