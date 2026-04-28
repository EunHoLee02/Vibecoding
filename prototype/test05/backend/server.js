const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const { analyzeSupplements } = require("./lib/analysis");
const { findSampleById, listSampleSummaries } = require("./lib/data-store");

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 3050;
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendSuccess(response, data, statusCode = 200) {
  sendJson(response, statusCode, {
    success: true,
    data,
    error: null,
  });
}

function sendError(response, statusCode, code, message) {
  sendJson(response, statusCode, {
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function validateSupplements(supplements) {
  if (!Array.isArray(supplements) || supplements.length === 0) {
    return "영양제 목록이 비어 있습니다.";
  }

  for (const supplement of supplements) {
    if (!supplement.product_name || !String(supplement.product_name).trim()) {
      return "product_name은 필수입니다.";
    }

    if (!Array.isArray(supplement.ingredients) || supplement.ingredients.length === 0) {
      return "각 영양제에는 최소 1개의 ingredient가 필요합니다.";
    }

    for (const ingredient of supplement.ingredients) {
      if (!ingredient.name || !String(ingredient.name).trim()) {
        return "ingredient.name은 필수입니다.";
      }

      if (ingredient.amount === "" || ingredient.amount === null || ingredient.amount === undefined || Number.isNaN(Number(ingredient.amount))) {
        return "ingredient.amount는 숫자여야 합니다.";
      }

      if (!ingredient.unit || !String(ingredient.unit).trim()) {
        return "ingredient.unit은 필수입니다.";
      }
    }
  }

  return null;
}

function sanitizeSupplements(supplements) {
  return supplements.map((supplement, supplementIndex) => ({
    id: supplement.id || `supplement-${supplementIndex + 1}`,
    product_name: String(supplement.product_name).trim(),
    manufacturer: String(supplement.manufacturer || "").trim(),
    ingredients: supplement.ingredients.map((ingredient) => ({
      name: String(ingredient.name).trim(),
      amount: Number(ingredient.amount),
      unit: String(ingredient.unit).trim(),
    })),
  }));
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    default:
      return "text/html; charset=utf-8";
  }
}

function serveStaticFile(requestPath, response) {
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const resolvedPath = path.normalize(path.join(FRONTEND_DIR, safePath));

  if (!resolvedPath.startsWith(FRONTEND_DIR)) {
    sendError(response, 403, "forbidden", "허용되지 않은 경로입니다.");
    return;
  }

  fs.readFile(resolvedPath, (error, buffer) => {
    if (error) {
      sendError(response, 404, "not_found", "요청한 파일을 찾을 수 없습니다.");
      return;
    }

    response.writeHead(200, { "Content-Type": getContentType(resolvedPath) });
    response.end(buffer);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendSuccess(response, {
      status: "ok",
      service: "well-track-prototype",
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/samples") {
    sendSuccess(response, {
      samples: listSampleSummaries(),
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/uploads/mock") {
    try {
      const body = await readJsonBody(request);
      const requestedSampleId = body.sample_id || "sample-daily-balance";
      const sample = findSampleById(requestedSampleId);

      if (!sample) {
        sendError(response, 404, "sample_not_found", "선택한 샘플을 찾을 수 없습니다.");
        return;
      }

      sendSuccess(response, {
        source_type: body.file_name ? "upload_stub" : "sample",
        upload_status: "ready",
        sample_id: sample.sample_id,
        file_name: body.file_name || null,
        supplements: sample.supplements,
      });
    } catch (error) {
      sendError(response, 400, "invalid_json", "업로드 요청 형식이 올바르지 않습니다.");
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/analysis") {
    try {
      const body = await readJsonBody(request);
      const supplements = sanitizeSupplements(body.supplements || []);
      const validationError = validateSupplements(supplements);

      if (validationError) {
        sendError(response, 400, "validation_error", validationError);
        return;
      }

      sendSuccess(response, {
        source_type: body.source_type || "manual",
        ...analyzeSupplements(supplements),
      });
    } catch (error) {
      sendError(response, 400, "invalid_request", "분석 요청을 처리하지 못했습니다.");
    }
    return;
  }

  if (request.method === "GET") {
    serveStaticFile(url.pathname, response);
    return;
  }

  sendError(response, 404, "not_found", "지원하지 않는 요청입니다.");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`PORT ${PORT} is already in use. Set a different PORT value and run again.`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Well Track Prototype server is running on http://localhost:${PORT}`);
});
