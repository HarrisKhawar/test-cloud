const { updateDocument } = require("../../util/firestore/update-document");
const { handleRequest } = require("../request-handling/handle-request");
const { logError, logSuccess } = require("../../util/logs/logging");
const { pushExpoNotification } = require("../../util/expo/push-notification");
const { getCollection } = require("../../util/firestore/get-collection");

/* ==========================================================================
 * CUSTOMER: UPDATE SETTINGS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - settings: <map> { key: <string>, value: <bool> }

/* ========================================================================== */
const update_settings = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { settings } = request.body;
    if (!settings) throw new Error("Missing required fields.");

    // Update Settings
    const update = `notifications.${settings.key}`;
    await updateDocument("Customers", customerId, {
      [update]: settings.value,
    });

    // Handle Response
    logSuccess("update_settings", "Settings Updated.");

    // Send Response
    response.status(200).json({ message: "Updated settings." });

    // Handle Error
  } catch (err) {
    logError("udpate_settings:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = update_settings;
