const { sendSuccess } = require("../utils/response");

function healthController(_request, response) {
  return sendSuccess(response, {
    service: "welltrack-prototype-test04",
    status: "ok",
  });
}

module.exports = {
  healthController,
};
