import { Router } from "express";
import { getSampleBundle } from "../data/sampleBundles.js";
import { analyzeSupplements } from "../services/analysisService.js";
import {
  createInputBundle,
  getAnalysis,
  getInputBundle,
  saveAnalysis,
} from "../services/prototypeStore.js";
import {
  validateAnalysisRequest,
  validateManualBundle,
  validateUploadBundle,
} from "../utils/validation.js";

export const prototypeRouter = Router();

function sendError(response, statusCode, code, message) {
  response.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  });
}

prototypeRouter.get("/health", (_, response) => {
  response.json({
    success: true,
    data: {
      status: "ok",
      service: "welltrack-test06-backend",
    },
    error: null,
  });
});

prototypeRouter.post("/input-bundles", (request, response) => {
  const validationError = validateManualBundle(request.body);

  if (validationError) {
    return sendError(response, 400, "INVALID_INPUT", validationError);
  }

  const inputBundle = createInputBundle({
    source_type: "manual",
    supplements: request.body.supplements,
  });

  return response.status(201).json({
    success: true,
    data: inputBundle,
    error: null,
  });
});

prototypeRouter.post("/upload-bundles", (request, response) => {
  const validationError = validateUploadBundle(request.body);

  if (validationError) {
    return sendError(response, 400, "INVALID_UPLOAD_REQUEST", validationError);
  }

  const sampleKey = request.body.sample_key || "daily_balance_pack";
  const supplements = getSampleBundle(sampleKey);
  const inputBundle = createInputBundle({
    source_type: "sample_upload",
    supplements,
    upload_stub: {
      upload_mode: "sample_upload",
      sample_key: sampleKey,
      file_name: request.body.file_name || "",
      ocr_status: "stubbed",
    },
  });

  return response.status(201).json({
    success: true,
    data: inputBundle,
    error: null,
  });
});

prototypeRouter.post("/analyses", (request, response) => {
  const validationError = validateAnalysisRequest(request.body);

  if (validationError) {
    return sendError(response, 400, "INVALID_ANALYSIS_REQUEST", validationError);
  }

  const inputBundle = getInputBundle(request.body.input_bundle_id);

  if (!inputBundle) {
    return sendError(response, 404, "INPUT_BUNDLE_NOT_FOUND", "분석할 입력 묶음을 찾지 못했습니다.");
  }

  try {
    const result = analyzeSupplements(inputBundle.supplements);
    const analysis = saveAnalysis({
      input_bundle_id: inputBundle.input_bundle_id,
      analysis_status: "completed",
      result,
    });

    return response.status(201).json({
      success: true,
      data: analysis,
      error: null,
    });
  } catch {
    return sendError(
      response,
      500,
      "ANALYSIS_FAILED",
      "분석 중 문제가 생겼습니다. 입력 내용을 다시 확인해주세요.",
    );
  }
});

prototypeRouter.get("/analyses/:analysis_id", (request, response) => {
  const analysis = getAnalysis(request.params.analysis_id);

  if (!analysis) {
    return sendError(response, 404, "ANALYSIS_NOT_FOUND", "분석 결과를 찾지 못했습니다.");
  }

  return response.json({
    success: true,
    data: analysis,
    error: null,
  });
});
