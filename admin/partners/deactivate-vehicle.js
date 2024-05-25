const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getSubcollection } = require("../../util/firestore/get-subcollection");
const { getDocument } = require("../../util/firestore/get-document");
const {
  updateSubcollectionDocument,
} = require("../../util/firestore/update-subcollection-document");
const { updateDocument } = require("../../util/firestore/update-document");
const { sendMessage } = require("../../util/twilio/send-message");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const {
  getSubcollectionDocument,
} = require("../../util/firestore/get-subcollection-document");
const FieldValue = require("firebase-admin").firestore.FieldValue;

/* ==========================================================================
* ADMIN: DEACTIVATE VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - vin: <string>
    - partnerId: <string>
    
/* ========================================================================== */
const deactivate_vehicle = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    const { vin, partnerId } = request.body;

    // Confirm Required Fields
    if (!vin || !partnerId) throw new Error("Missing required fields.");

    // Get Partner
    const partner = await getDocument("Partners", partnerId);

    // Fetch Partner
    const vehicle = await getSubcollectionDocument(
      "Partners",
      partnerId,
      "Vehicles",
      vin
    );

    // Update Vehicle
    await updateSubcollectionDocument("Partners", partnerId, "Vehicles", vin, {
      status: "pending",
      id: FieldValue.delete(),
      image: FieldValue.delete(),
      trim: FieldValue.delete(),
      color: FieldValue.delete(),
    });

    // Update Listed Vehicle
    await updateDocument("Vehicles", listedVehicle.id, {
      partnerId: FieldValue.delete(),
    });

    // Send Notification
    await sendMessage(
      `Your ${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.vin} has been deactivated.`,
      partner.phone
    );

    // Send Slack Notification
    await sendSlackNotification(
      `Admin deactivated ${vehicle.make} ${vehicle.model} ${vehicle.year} of ${partner.name} - ${vehicle.vin}`,
      "#notifications"
    );

    // Log Success
    logSuccess("admin-deactivate-vehicle", "Successfully deactivated vehicle.");

    // Send Response
    response.status(200).json(vehicle);

    // Handle Error
  } catch (err) {
    logError("admin-deactivate-vehicle", err.message);
    response.status(500).send("Error deactivating vehicle.");
  }
};

module.exports = deactivate_vehicle;
