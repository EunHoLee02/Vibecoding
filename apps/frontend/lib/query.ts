import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export const queryKeys = {
  auth: ["auth", "me"] as const,
  supplements: ["supplements", "list"] as const,
  supplement: (id: string) => ["supplements", "detail", id] as const,
  ocrJob: (jobId: string) => ["ocr", "job", jobId] as const,
  analysisPreview: (key: string) => ["analyses", "preview", key] as const,
  analysisStatus: (runId: string) => ["analyses", "status", runId] as const,
  analysisResult: (analysisId: string) =>
    ["analyses", "detail", analysisId] as const,
  inquiries: ["inquiries", "list"] as const,
};
