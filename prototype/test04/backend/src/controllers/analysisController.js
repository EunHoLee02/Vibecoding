const { analyzeSupplements } = require("../services/analysisService");
const { normalizeSupplementsPayload } = require("../services/supplementService");
const { readJsonBody } = require("../utils/readBody");
const { sendError, sendSuccess } = require("../utils/response");

async function handleAnalysis(request, response) {
  try {
    const payload = await readJsonBody(request);
    const supplements = normalizeSupplementsPayload(payload.supplements);
    const result = analyzeSupplements(supplements);

    return sendSuccess(response, result);
  } catch (error) {
    return sendError(response, 400, "ANALYSIS_REQUEST_INVALID", error.message);
  }
}

module.exports = {
  handleAnalysis,
};
