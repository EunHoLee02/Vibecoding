const http = require("http");
const path = require("path");
const { handleRequest } = require("./routes");

function createApp() {
  const frontendRoot = path.resolve(__dirname, "../../frontend");

  return http.createServer((request, response) => {
    handleRequest(request, response, { frontendRoot });
  });
}

module.exports = {
  createApp,
};
