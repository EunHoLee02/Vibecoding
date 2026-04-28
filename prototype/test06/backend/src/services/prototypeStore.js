const store = {
  inputBundles: new Map(),
  analyses: new Map(),
  nextInputBundleNumber: 1,
  nextAnalysisNumber: 1,
};

function nextId(prefix, counterKey) {
  const value = store[counterKey];
  store[counterKey] += 1;
  return `${prefix}_${String(value).padStart(3, "0")}`;
}

export function createInputBundle({ source_type, supplements, upload_stub = null }) {
  const inputBundle = {
    input_bundle_id: nextId("bundle", "nextInputBundleNumber"),
    source_type,
    input_status: "ready",
    supplements,
    upload_stub,
  };

  store.inputBundles.set(inputBundle.input_bundle_id, inputBundle);
  return inputBundle;
}

export function getInputBundle(inputBundleId) {
  return store.inputBundles.get(inputBundleId) || null;
}

export function saveAnalysis({ input_bundle_id, analysis_status, result }) {
  const analysis = {
    analysis_id: nextId("analysis", "nextAnalysisNumber"),
    input_bundle_id,
    analysis_status,
    result,
  };

  store.analyses.set(analysis.analysis_id, analysis);
  return analysis;
}

export function getAnalysis(analysisId) {
  return store.analyses.get(analysisId) || null;
}
