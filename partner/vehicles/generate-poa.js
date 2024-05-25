const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const {
  getSubcollectionDocument,
} = require("../../util/firestore/get-subcollection-document");
const { getDocument } = require("../../util/firestore/get-document");
const { createPOA } = require("../../util/partners/create-poa");
const {
  updateSubcollectionDocument,
} = require("../../util/firestore/update-subcollection-document");
/* ==========================================================================
 * PARTNER: GENERATE POA
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - vehicleId: <string>
    - signature: <string>
/* ========================================================================== */
const generate_poa = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const { vehicleId, signature } = request.body;
    if (!vehicleId || !signature) throw new Error("Missing required fields.");

    // Get Vehicle
    const vehicle = await getSubcollectionDocument(
      "Partners",
      partnerId,
      "Vehicles",
      vehicleId
    );

    // Get Partner
    const partner = await getDocument("Partners", partnerId);

    // Generate POA
    const url = await createPOA(partner, vehicle, signature);

    // Update Partner
    await updateSubcollectionDocument(
      "Partners",
      partnerId,
      "Vehicles",
      vehicleId,
      {
        poa: url,
      }
    );

    // Send Slack Notification
    await sendSlackNotification(
      `${partner.name}: Generated POA for ${vehicle.make} ${vehicle.model} ${vehicle.year}`
    );

    // Send Response
    response.status(200).json({ url: url });

    // Handle Error
  } catch (err) {
    logError("partner - generate_poa", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = generate_poa;
