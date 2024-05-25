const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");
const { documentExists } = require("../../util/firestore/document-exists");
const { setDocument } = require("../../util/firestore/set-document");
const FieldValue = require("firebase-admin").firestore.FieldValue;
/* ==========================================================================
 * CUSTOMER: SEND MESSAGE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - message: <string>
/* ========================================================================== */
const send_message = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { message: message } = request.body;
    if (!message) throw new Error("Missing Required Field: message");

    // Create Message Entry
    const entry = {
      message: message,
      time: Date.now(),
      user: true,
    };

    // Check if Messages Document Exists
    if (await documentExists("Messages", customerId)) {
      // Add Message Entry
      await updateDocument("Messages", customerId, {
        messages: FieldValue.arrayUnion(entry),
      });
    } else {
      // Create Messages Document
      await setDocument("Messages", customerId, {
        messages: [entry],
      });
    }

    // Send Slack Notification
    const customer = await getDocument("Customers", customerId);
    await sendSlackNotification(
      `${customer.firstName} ${customer.lastName} #${customerId}]: ${message}`,
      "#support"
    );

    // Send Response
    response.status(200).json(entry);

    // Handle Error
  } catch (err) {
    logError("send_message:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = send_message;
