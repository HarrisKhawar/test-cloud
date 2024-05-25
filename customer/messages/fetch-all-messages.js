const { logError } = require("../../util/logs/logging");
const { documentExists } = require("../../util/firestore/document-exists");
const { handleRequest } = require("../request-handling/handle-request");
const { getDocument } = require("../../util/firestore/get-document");
/* ==========================================================================
 * CUSTOMER: FETCH ALL MESSAGES
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
/* ========================================================================== */
const fetch_all_messages = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;

    // Fetch Messages
    let messages = [];
    if (await documentExists("Messages", customerId)) {
      const arr = await getDocument("Messages", customerId);
      messages = arr.messages;
    }

    // Send Response
    response.status(200).json(messages);

    // Handle Error
  } catch (err) {
    logError("fetch_messages:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_all_messages;
