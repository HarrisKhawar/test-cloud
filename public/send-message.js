const { logError } = require("../util/logs/logging");
const {
  sendSlackNotification,
} = require("../util/slack/send-slack-notification");
const { updateDocument } = require("../util/firestore/update-document");
const { documentExists } = require("../util/firestore/document-exists");
const { setDocument } = require("../util/firestore/set-document");
const FieldValue = require("firebase-admin").firestore.FieldValue;
/* ==========================================================================
 * PUBLIC: SEND MESSAGE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
    
* Request Body:
    - customerId: <string>
    - name: <string>
    - phone: <string>
    - message: <string>
/* ========================================================================== */
const send_message = async (request, response) => {
  try {
    // Confirm Required Fields
    const { customerId } = request.body;
    const { message } = request.body;
    const { name } = request.body;
    const { phone } = request.body;
    if (!customerId) throw new Error("Missing Required Field: customerid");
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
    await sendSlackNotification(
      `${name} #${phone}]: sent a message: ${message}`,
      "#support"
    );

    // Send Response
    response.status(200).json(entry);

    // Handle Error
  } catch (err) {
    logError("send_message", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = send_message;
