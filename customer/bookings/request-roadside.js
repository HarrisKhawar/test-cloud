const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { reverseGeocoding } = require("../../util/tools/reverse-geocoding");
const { documentExists } = require("../../util/firestore/document-exists");
const { updateDocument } = require("../../util/firestore/update-document");
const { setDocument } = require("../../util/firestore/set-document");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const FieldValue = require("firebase-admin").firestore.FieldValue;
/* ==========================================================================
* CUSTOMER: REQUEST ROADSIDE ASSISTANCE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userid: <string>
    
* Request Body:
    - longitude: <number>
    - latitude: <number>
    - description: <string>
    - phone: <string>
/* ========================================================================== */
const request_roadside = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { longitude, latitude, description, phone } = request.body;
    if (!longitude || !latitude || !description || !phone)
      throw new Error("Missing Required Fields.");

    // Get Customer
    const customer = await getDocument("Customers", customerId);
    if (!customer.booking) throw new Error("No Booking Found.");

    // Get Booking
    const booking = await getDocument("Bookings", customer.booking.id);
    if (!booking.status === "active") throw new Error("Booking is not active. Please check in first.");

    // Get Vehicle
    const vehicle = await getDocument("Vehicles", booking.vehicle.id);

    // Get Customer Current Location
    const address = await reverseGeocoding(latitude, longitude);

    const message = `Roadside assistance request:
     Address: ${address}
     Description: ${description}
     Phone: ${phone}`;
    const res =
      "Your request was received. If we do not give you a call in 15 minutes, please give us a call.";

    // Add Customer Message
    if (await documentExists("Messages", customerId)) {
      await updateDocument("Messages", customerId, {
        messages: FieldValue.arrayUnion({
          message: message,
          time: Date.now(),
          user: true,
        }),
      });
    } else {
      await setDocument("Messages", customerId, {
        messages: [
          {
            message: message,
            time: Date.now(),
            user: true,
          },
        ],
      });
    }

    // Add Admin Message
    await updateDocument("Messages", customerId, {
      messages: FieldValue.arrayUnion({
        message: res,
        time: Date.now(),
        user: false,
      }),
    });

    // Send Slack Notification
    await sendSlackNotification(
      `${customer.firstName} ${customer.lastName}
      ${message}
      ${vehicle.make} ${vehicle.model} ${vehicle.year}
      VIN: ${vehicle.vin}`
    );

    // Log Success
    logSuccess("customer-request-roadside", "Roadside Assistance Requested.");

    // Send Response
    response.status(200).json({ message: "Roadside Assistance Requested." });

    // Handle Error
  } catch (err) {
    logError("customer-request-roadside", err.message);
    console.log(err);
    response.status(500).send(err.message);
  }
};

module.exports = request_roadside;
