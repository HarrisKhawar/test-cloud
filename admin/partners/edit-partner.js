const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getSubcollection } = require("../../util/firestore/get-subcollection");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");

/* ==========================================================================
* ADMIN: EDIT PARTNER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - partnerId: <string>
    - items: <object> { key: value }
    
/* ========================================================================== */
const edit_partner = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    const { partnerId, items } = request.body;
    console.log(items);

    // Fetch Partner
    const partner = await getDocument("Partners", partnerId);

    // Make Changes
    Object.keys(items).forEach((key) => {
      partner[key] = items[key];
    });

    // Update Partner
    await updateDocument("Partners", partnerId, {
      ...partner,
    });

    // Send Slack Notification
    await sendSlackNotification(`Admin has editted Partner ${partner.name}'s profile.`, "#admin");

    // Log Success
    logSuccess("admin-edit-partner", "Successfully editted partner.");

    // Send Response
    response.status(200).json(partner);

    // Handle Error
  } catch (err) {
    logError("admin-edit-partner:", err.message);
    response.status(500).send("Error editting partner.");
  }
};

module.exports = edit_partner;
