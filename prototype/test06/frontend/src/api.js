const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || "요청 처리 중 문제가 생겼습니다.");
  }

  return payload.data;
}

export function createInputBundle(payload) {
  return request("/api/input-bundles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createUploadBundle(payload) {
  return request("/api/upload-bundles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createAnalysis(payload) {
  return request("/api/analyses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAnalysis(analysisId) {
  return request(`/api/analyses/${analysisId}`);
}
