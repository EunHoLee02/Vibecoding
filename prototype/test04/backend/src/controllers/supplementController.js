const {
  normalizeSupplementsPayload,
  resolveSampleSupplements,
} = require("../services/supplementService");
const { readJsonBody } = require("../utils/readBody");
const { sendError, sendSuccess } = require("../utils/response");

async function handleManualSupplements(request, response) {
  try {
    const payload = await readJsonBody(request);
    const supplements = normalizeSupplementsPayload(payload.supplements);

    return sendSuccess(response, {
      input_source: "manual",
      supplements,
    });
  } catch (error) {
    return sendError(response, 400, "INVALID_SUPPLEMENTS", error.message);
  }
}

async function handleSampleSupplements(request, response) {
  try {
    const payload = await readJsonBody(request);
    const result = resolveSampleSupplements(payload);

    return sendSuccess(response, result);
  } catch (error) {
    return sendError(response, 400, "INVALID_SAMPLE_REQUEST", error.message);
  }
}

module.exports = {
  handleManualSupplements,
  handleSampleSupplements,
};
