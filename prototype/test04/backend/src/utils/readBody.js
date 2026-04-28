function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;

      if (rawBody.length > 1024 * 1024) {
        reject(new Error("요청 본문이 너무 큽니다."));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (_error) {
        reject(new Error("JSON 형식이 올바르지 않습니다."));
      }
    });

    request.on("error", () => {
      reject(new Error("요청을 읽는 중 오류가 발생했습니다."));
    });
  });
}

module.exports = {
  readJsonBody,
};
