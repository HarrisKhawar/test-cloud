const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { documentExists } = require("../../util/firestore/document-exists");
const { updateDocument } = require("../../util/firestore/update-document");
const { setDocument } = require("../../util/firestore/set-document");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const FieldValue = require("firebase-admin").firestore.FieldValue;
/* ==========================================================================
* CUSTOMER: SWAP REQUEST
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userid: <string>
    
* Request Body:
    - vehicleId: <string>
    - date: <string>
    - time: <string>
/* ========================================================================== */
const request_swap = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { vehicleId, date, time } = request.body;
    if (!vehicleId || !date || !time)
      throw new Error("Missing Required Fields.");

    // Get Customer
    const customer = await getDocument("Customers", customerId);
    if (!customer.booking) throw new Error("No Booking Found.");

    // Get Booking
    const booking = await getDocument("Bookings", customer.booking.id);
    if (!booking.status === "active") throw new Error("Booking is not active. Please check in first.");

    // Get Vehicle
    const currentVehicle = await getDocument("Vehicles", booking.vehicle.id);
    const swapVehicle = await getDocument("Vehicles", vehicleId);
    

    const message = `Swap Request:
     Vehicle: ${swapVehicle.make} ${swapVehicle.model} ${swapVehicle.year}
     Date: ${date}
     Time: ${time}`;
    const res =
      "Your request was received. We will schedule the swap and notify you when ready.";

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
      Swap Request:
      ${currentVehicle.make} ${currentVehicle.model} ${currentVehicle.year} 
      with
      ${swapVehicle.make} ${swapVehicle.model} ${swapVehicle.year}
      on ${date} at ${time}`
    );

    // Log Success
    logSuccess("customer-request-swap", "Swap Requested.");

    // Send Response
    response.status(200).json({ message: "Swap Requested." });

    // Handle Error
  } catch (err) {
    logError("customer-request-swap", err.message);
    console.log(err);
    response.status(500).send(err.message);
  }
};

module.exports = request_swap;
