const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { handleRequest } = require("../request-handling/handle-request");

/* ==========================================================================
 * CUSTOMER: FETCH BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - id: <string>
/* ========================================================================== */
const fetch_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { id } = request.body;
    if (!id) throw new Error("Missing Booking ID.");

    // Fetch Booking
    const booking = await getDocument("Bookings", id);

    // Fetch Vehicle
    const vehicle = await getDocument("Vehicles", booking.vehicle.id);

    // Insurance to Booking
    if (booking.status === "active") {
      if (vehicle.insurance) booking.insurance = vehicle.insurance;
      if (vehicle.registration) booking.registration = vehicle.registration;
    }

    // Check Booking Belongs to User
    if (booking.customer.id !== customerId)
      throw new Error("Booking does not belong to user.");

    // Log Success
    logSuccess("fetch_booking", "Successfully fetched Booking.");

    // Send Response
    response.status(200).json(booking);

    // Handle Error
  } catch (err) {
    logError("fetch_booking", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_booking;
