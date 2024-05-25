const { logRequest } = require("../util/logs/log-incoming-request");
const {
  handleOptionsRequest,
} = require("../util/request-handling/handle-options-request");

const handlePublicRequest = (request, response) => {
  try {
    // Log Request
    logRequest(request);

    // Set CORS headers
    response.set("Access-Control-Allow-Origin", "*");
    if (request.method === "OPTIONS") {
      handleOptionsRequest(response);
      return true;
    }

    // Verify request
    const authToken = request.headers.authorization;
    if (authToken !== process.env.APP_AUTH_TOKEN)
      throw new Error("Invalid Authorization Token.");

    return false;
  } catch (err) {
    throw new Error("Error handling fetch request: " + err.message);
  }
};

module.exports = { handlePublicRequest };
