import { AnalysisResult } from "@/lib/types";

const STORAGE_KEY = "well-track-prototype-latest-analysis";

export function saveLatestAnalysis(result: AnalysisResult) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}

export function loadLatestAnalysis(): AnalysisResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AnalysisResult;
  } catch {
    return null;
  }
}

export function clearLatestAnalysis() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(STORAGE_KEY);
}
