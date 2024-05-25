const { handleRequest } = require("../request-handling/handle-request");
const { completeBooking } = require("../../util/bookings/complete-booking");
const { logError } = require("../../util/logs/logging");
/* ==========================================================================
* ADMIN: COMPLETE BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - bookingId: <string>
/* ========================================================================== */
const complete_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { bookingId } = request.body;
    if (!bookingId) throw new Error("Missing Booking ID.");

    // Complete Booking
    await completeBooking(bookingId);

    // Send Response
    response.status(200).send(bookingId);

    // Handle Error
  } catch (err) {
    logError("admin_complete_booking", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = complete_booking;
