const { healthController } = require("./controllers/healthController");
const {
  handleManualSupplements,
  handleSampleSupplements,
} = require("./controllers/supplementController");
const { handleAnalysis } = require("./controllers/analysisController");
const { sendError } = require("./utils/response");
const { serveStaticAsset, serveAppDocument } = require("./utils/staticServer");

function handleRequest(request, response, context) {
  const url = new URL(request.url, "http://localhost");
  const { pathname } = url;

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && pathname === "/api/health") {
    return healthController(request, response);
  }

  if (request.method === "POST" && pathname === "/api/supplements/manual") {
    return handleManualSupplements(request, response);
  }

  if (request.method === "POST" && pathname === "/api/supplements/sample") {
    return handleSampleSupplements(request, response);
  }

  if (request.method === "POST" && pathname === "/api/analysis") {
    return handleAnalysis(request, response);
  }

  if (request.method === "GET" && pathname.startsWith("/assets/")) {
    return serveStaticAsset(response, context.frontendRoot, pathname);
  }

  if (request.method === "GET" && pathname.startsWith("/src/")) {
    return serveStaticAsset(response, context.frontendRoot, pathname);
  }

  if (
    request.method === "GET" &&
    (pathname === "/" || pathname === "/sample" || pathname === "/result")
  ) {
    return serveAppDocument(response, context.frontendRoot);
  }

  return sendError(response, 404, "NOT_FOUND", "요청한 경로를 찾을 수 없습니다.");
}

module.exports = {
  handleRequest,
};
