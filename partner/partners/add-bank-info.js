const { updateDocument } = require("../../util/firestore/update-document");
const {
  validateStorageURL,
} = require("../../util/validation/validate-storage-url");
const { handleRequest } = require("../request-handling/handle-request");
const { handleResponse } = require("../request-handling/handle-response");
const { logError } = require("../../util/logs/logging");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
 * PARTNER: ADD BANK INFORMATION
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - name: <string>
  - routing: <string>
  - account: <string>

/* ========================================================================== */
const add_bank_info = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const { name, routing, account } = request.body;
    if (!name) throw new Error("Missing Bank Name.");
    if (!routing) throw new Error("Missing Routing Number.");
    if (!account) throw new Error("Missing Account Number.");

    // Add Bank Information
    await updateDocument("Partners", partnerId, {
      bank: {
        name,
        routing,
        account,
      },
    });

    // Send Slack Notification
    const partner = await getDocument("Partners", partnerId);
    await sendSlackNotification(
      "Partner " + partner.name + " added bank information."
    );

    // Send Response
    response.status(200).json({ message: "Done" });

    // Handle Error
  } catch (err) {
    logError("add-bank-info:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_bank_info;
