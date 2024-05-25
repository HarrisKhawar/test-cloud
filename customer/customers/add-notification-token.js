const { updateDocument } = require("../../util/firestore/update-document");
const { handleRequest } = require("../request-handling/handle-request");
const { handleResponse } = require("../request-handling/handle-response");
const { logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
 * CUSTOMER: ADD NOTIFICATION TOKEN
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - token: <string>

/* ========================================================================== */
const add_notification_token = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { token } = request.body;
    if (!token) throw new Error("Missing required fields.");

    // Get Customer
    const customer = await getDocument("Customers", customerId);

    // Check if tokens exist
    const tokensExist = customer.notifications?.tokens?.length > 0;
    // Check if this token exists
    if (tokensExist) {
      // If token does not exist, add it
      const tokenExists = customer.notifications.tokens.includes(token);
      if (!tokenExists) {
        await updateDocument("Customers", customerId, {
          "notifications.tokens": [...customer.notifications.tokens, token],
        });
      }
      // If no tokens exist, add this token
    } else {
      await updateDocument("Customers", customerId, {
        "notifications.tokens": [token],
      });
    }

    // Send Response
    response.status(200).json({ message: "token added" });

    // Handle Error
  } catch (err) {
    logError("add_notification_token:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_notification_token;
