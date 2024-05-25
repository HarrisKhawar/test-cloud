const { logRequest } = require("../../util/logs/log-incoming-request");
const {
  handleOptionsRequest,
} = require("../../util/request-handling/handle-options-request");
const { authenticateUserRequest } = require("./authenticate-user-request");

// Returns false if request is not an options request
const handleRequest = async (request, response) => {
  try {
    // Log Incoming Request
    logRequest(request);

    // Set CORS headers
    response.set("Access-Control-Allow-Origin", "*");
    if (request.method === "OPTIONS") {
      handleOptionsRequest(response);
      return true;
    }

    // Verify request
    const authToken = request.headers.authorization;
    const idToken = request.headers.idtoken;
    const userId = request.headers.userid;
    await authenticateUserRequest(authToken, idToken, userId);

    // Return false to indicate request is not an options request;
    return false;
  } catch (err) {
    throw new Error("Error handling request: " + err.message);
  }
};

module.exports = { handleRequest };
