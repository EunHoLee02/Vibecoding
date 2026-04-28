import { AnalysisResult, ParseStubResponse, SamplePayload, SupplementInput } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload?.error?.message ?? "요청 처리 중 오류가 발생했습니다.");
  }

  return payload.data as T;
}

export async function getSamplePayloads(): Promise<SamplePayload[]> {
  const data = await request<{ samples: SamplePayload[] }>("/api/v1/sample-payloads");
  return data.samples;
}

export async function parseStubPayload(input: {
  sample_id?: string;
  file_name?: string;
}): Promise<ParseStubResponse> {
  return request<ParseStubResponse>("/api/v1/uploads/parse-stub", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createAnalysis(supplements: SupplementInput[]): Promise<{
  analysis_id: string;
  status: "completed";
  summary_line: string;
}> {
  return request("/api/v1/analyses", {
    method: "POST",
    body: JSON.stringify({ supplements }),
  });
}

export async function getAnalysisResult(analysisId: string): Promise<AnalysisResult> {
  return request<AnalysisResult>(`/api/v1/analyses/${analysisId}`);
}
