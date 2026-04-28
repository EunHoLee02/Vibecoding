function sendSuccess(response, data, statusCode = 200) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });

  response.end(
    JSON.stringify({
      success: true,
      data,
    })
  );
}

function sendError(response, statusCode, code, message) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });

  response.end(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
      },
    })
  );
}

module.exports = {
  sendSuccess,
  sendError,
};
