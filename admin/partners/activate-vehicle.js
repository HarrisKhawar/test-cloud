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
const { sendSlackNotification } = require("../../util/slack/send-slack-notification");
const { getSubcollectionDocument } = require("../../util/firestore/get-subcollection-document");

/* ==========================================================================
* ADMIN: ACTIVATE VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - vin: <string>
    - partnerId: <string>
    
/* ========================================================================== */
const activate_vehicle = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    const { vin, partnerId } = request.body;

    // Confirm Required Fields
    if (!vin || !partnerId) throw new Error("Missing required fields.");

    // Get Partner
    const partner = await getDocument("Partners", partnerId);

    // Fetch Partner
    const vehicle = await getSubcollectionDocument("Partners", partnerId, "Vehicles", vin);

    // Check Listed Vehicle
    const listedVehicles = await getCollection("Vehicles");
    const listedVehicle = listedVehicles.filter(
      (vehicle) => vehicle.vin.toLowerCase() === vin.toLowerCase()
    )[0];
    if (!listedVehicle)
      throw new Error(
        "Vehicle not listed. Please list vehicle on admin dashboard first."
      );

    // Update Vehicle
    await updateSubcollectionDocument("Partners", partnerId, "Vehicles", vin, {
      status: "active",
      id: listedVehicle.id,
      image: listedVehicle.images.corner,
      trim: listedVehicle.trim,
      color: listedVehicle.color,
    });

    // Update Listed Vehicle
    await updateDocument("Vehicles", listedVehicle.id, {
      partnerId: partnerId,
    });

    // Send Notification
    await sendMessage(
      `Your ${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.vin} has been activated on POSH Partners Program.`,
      partner.phone
    );

    // Send Slack Notification
    await sendSlackNotification(
      `Admin activated a ${vehicle.make} ${vehicle.model} ${vehicle.year} for ${partner.name} - ${vehicle.vin}`,
      "#admin"
    )

    // Log Success
    logSuccess("admin_activate_vehicle", "Successfully activated vehicle.");

    // Send Response
    response.status(200).json(vehicle);

    // Handle Error
  } catch (err) {
    logError("admin_activate_vehicle:", err.message);
    response.status(500).send("Error activating vehicle.");
  }
};

module.exports = activate_vehicle;
