async function requestJson(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body?.error?.message || "요청 처리 중 오류가 발생했습니다.");
  }

  return body.data;
}

export async function normalizeManualSupplements(supplements) {
  return requestJson("/api/supplements/manual", { supplements });
}

export async function loadSampleSupplements(payload) {
  return requestJson("/api/supplements/sample", payload);
}

export async function runAnalysis(supplements) {
  return requestJson("/api/analysis", { supplements });
}
