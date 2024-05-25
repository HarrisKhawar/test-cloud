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
 * PARTNER: ADD DRIVERS LICENSE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - drivers_license_front: <string> (url)
  - drivers_license_back: <string> (url)

/* ========================================================================== */
const add_drivers_license = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const { drivers_license_front, drivers_license_back } = request.body;
    if (!drivers_license_front)
      throw new Error("Missing Drivers License Front.");
    if (!drivers_license_back) throw new Error("Missing Drivers License Back.");

    // Validate storage urls
    if (
      !validateStorageURL(drivers_license_front) ||
      !validateStorageURL(drivers_license_back)
    )
      throw new Error("Invalid Storage URL.");

    // Add Drivers License
    await updateDocument("Partners", partnerId, {
      drivers_license_front,
      drivers_license_back,
    });

    // Send Slack Notification
    const partner = await getDocument("Partners", partnerId);
    await sendSlackNotification("Partner " + partner.name + " added their drivers license.");

    // Send Response
    response
      .status(200)
      .json({ front: drivers_license_front, back: drivers_license_back });

    // Handle Error
  } catch (err) {
    logError("add_drivers_license:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_drivers_license;
