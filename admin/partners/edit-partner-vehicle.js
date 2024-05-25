const { logError } = require("../../util/logs/logging");
const { documentExists } = require("../../util/firestore/document-exists");
const {
  setSubcollectionDocument,
} = require("../../util/firestore/set-subcollection-document");
const {
    getSubcollectionDocument,
  } = require("../../util/firestore/get-subcollection-document");
const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess } = require("../../util/logs/logging");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const { getDocument } = require("../../util/firestore/get-document");
/* ==========================================================================
 * ADMIN: ADD PARTNER VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - partnerId: <string>
    - vin: <string>
    - items: <object> { key: value }
/* ========================================================================== */
const edit_partner_vehicle = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const {
      partnerId,
      vin,
      items
    } = request.body;
    if (!vin)
      throw new Error("Missing vehicle VIN.");

    // Get Partner
    if (!(await documentExists("Partners", partnerId)))
      throw new Error("Partner account not found.");
    const partner = await getDocument("Partners", partnerId);

    // Get Vehicle
    const vehicle = await getSubcollectionDocument("Partners", partnerId, "Vehicles", vin);

    // Make Changes
    Object.keys(items).forEach((key) => {
      if (items[key] === "delete" &&  vehicle[key]) delete vehicle[key];
      else vehicle[key] = items[key];
    });

    // Update Vehicle
    await setSubcollectionDocument(
      "Partners",
      partnerId,
      "Vehicles",
      vin,
      vehicle
    );

    // Send Slack Notification
    await sendSlackNotification(
      `Admin editted a ${vehicle.make} ${vehicle.model} ${vehicle.year} for ${partner.name} - ${vehicle.vin}`, "#admin"
    );

    // Log Success
    logSuccess("admin_edit_partner_vehicle", "Successfully editted vehicle to partner.");

    // Send Response
    response.status(200).json({ partnerId: partnerId });

    // Handle Error
  } catch (err) {
    logError("edit-vehicle:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = edit_partner_vehicle;
