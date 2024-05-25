const { updateDocument } = require("../../util/firestore/update-document");
const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
 * CUSTOMER: DELETE NOTIFICATION TOKEN
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - token: <string>

/* ========================================================================== */
const delete_notification_token = async (request, response) => {
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
      // If token does not exist, delete it
      const tokenExists = customer.notifications.tokens.includes(token);
      if (tokenExists) {
        const newTokens = customer.notifications.tokens.filter(
          (t) => t !== token
        );
        await updateDocument("Customers", customerId, {
          "notifications.tokens": newTokens,
        });
      }
    }

    // Send Response
    response.status(200).json({ message: "token deleted" });

    // Handle Error
  } catch (err) {
    logError("delete_notification_token:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = delete_notification_token;
