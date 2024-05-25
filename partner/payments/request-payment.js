const { logError } = require("../../util/logs/logging");
const { documentExists } = require("../../util/firestore/document-exists");
const {
  setSubcollectionDocument,
} = require("../../util/firestore/set-subcollection-document");
const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess } = require("../../util/logs/logging");
const { setDocument } = require("../../util/firestore/set-document");
const { getDocument } = require("../../util/firestore/get-document");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const { getSubcollection } = require("../../util/firestore/get-subcollection");
/* ==========================================================================
 * PARTNER: REQUEST PAYMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - id: <string>
    - amount: <string>
    - description: <string>
    - vehicleId: <string>
    - document: <link> 
    
/* ========================================================================== */
const request_payment = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const { id, amount, description, vehicleId, document } = request.body;
    if ( !id || !amount || !description || !vehicleId || !document)
      throw new Error("Missing required fields.");

    // Get Partner
    if (!(await documentExists("Partners", partnerId)))
      throw new Error("Partner account not found.");
    const partner = await getDocument("Partners", partnerId);

    // Get Vehicle
    if (!await documentExists("Vehicles", vehicleId)) throw new Error("Vehicle not found or not activated.");
    const vehicle = await getDocument("Vehicles", vehicleId);
    

    const payment = {
      id,
      amount,
      description,
      vehicle: {
        id: vehicleId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        image: vehicle.images.corner,
        license: vehicle.license,
        vin: vehicle.vin,
      },
      attachement: document || false,
      date_created: new Date(),
      partner: {
        id: partnerId,
        name: partner.name,
      },
    };
    payment.status = "pending";

    // Add Vehicle to Partner
    await setSubcollectionDocument(
      "Partners",
      partnerId,
      "Payments",
      id,
      payment
    );

    // Add Payment to Payments
    await setDocument("Invoices", id, payment);

    // Send Slack Notification
    await sendSlackNotification(
      `Partner ${partner.name} requested $${amount} for "${description}" for ${vehicle.make} ${vehicle.model} ${vehicle.year}.`
    );

    // Log Success
    logSuccess("request_payment", "Successfully requested payment.");

    // Send Response
    response.status(200).json({ partnerId: partnerId });

    // Handle Error
  } catch (err) {
    logError("request-payment", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = request_payment;
