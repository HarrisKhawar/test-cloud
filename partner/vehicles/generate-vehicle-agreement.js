const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const {
  getSubcollectionDocument,
} = require("../../util/firestore/get-subcollection-document");
const { getDocument } = require("../../util/firestore/get-document");
const {
  updateSubcollectionDocument,
} = require("../../util/firestore/update-subcollection-document");
const { createVehicleAgreement } = require("../../util/partners/create-vehicle-agreement");
/* ==========================================================================
 * PARTNER: GENERATE VEHICLE AGREEMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - vehicleId: <string>
    - signature: <string>
/* ========================================================================== */
const generate_vehicle_agreement = async (request, response) => {
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
    const url = await createVehicleAgreement(partner, vehicle, signature);

    // Update Partner
    await updateSubcollectionDocument(
      "Partners",
      partnerId,
      "Vehicles",
      vehicleId,
      {
        agreement: url,
      }
    );

    // Send Slack Notification
    // await sendSlackNotification(
    //   `${partner.name}: Generated Vehicle Agreement for ${vehicle.make} ${vehicle.model} ${vehicle.year}`
    // );

    console.log(url);

    // Send Response
    response.status(200).json({ url: url });

    // Handle Error
  } catch (err) {
    logError("partner - generate-vehicle-agreement", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = generate_vehicle_agreement;
