import { AnalysisResult, SampleInputOption, SupplementInput, UploadParseResult } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type SuccessEnvelope<T> = {
  success: true;
  data: T;
  error: null;
};

type ErrorEnvelope = {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
  };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
  });

  const payload = (await response.json()) as SuccessEnvelope<T> | ErrorEnvelope;
  if (!response.ok || !payload.success) {
    const message = payload.success
      ? "요청 처리 중 오류가 발생했습니다."
      : payload.error.message;
    throw new Error(message);
  }

  return payload.data;
}

export async function getSampleInputs(): Promise<SampleInputOption[]> {
  const data = await request<{ sample_inputs: SampleInputOption[] }>("/api/v1/sample-inputs");
  return data.sample_inputs;
}

export async function parseUploadInput(input: {
  sampleId?: string;
  file?: File;
}): Promise<UploadParseResult> {
  const formData = new FormData();

  if (input.sampleId) {
    formData.append("sample_id", input.sampleId);
  }
  if (input.file) {
    formData.append("file", input.file);
  }

  return request<UploadParseResult>("/api/v1/uploads/parse", {
    method: "POST",
    body: formData,
  });
}

export async function createAnalysis(supplements: SupplementInput[]): Promise<AnalysisResult> {
  return request<AnalysisResult>("/api/v1/analyses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ supplements }),
  });
}
