const fs = require("fs");
const path = require("path");

function serveAppDocument(response, frontendRoot) {
  const indexPath = path.join(frontendRoot, "index.html");
  return serveFile(response, indexPath);
}

function serveStaticAsset(response, frontendRoot, pathname) {
  const normalizedPath = pathname.replace(/^\/+/, "");
  const filePath = path.join(frontendRoot, normalizedPath);

  if (!filePath.startsWith(frontendRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  return serveFile(response, filePath);
}

function serveFile(response, filePath) {
  fs.readFile(filePath, (error, file) => {
    if (error) {
      response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("File not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": getContentType(filePath),
    });
    response.end(file);
  });
}

function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/plain; charset=utf-8";
}

module.exports = {
  serveAppDocument,
  serveStaticAsset,
};
