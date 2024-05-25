const { handleRequest } = require("../request-handling/handle-request");
const { getBooking } = require("../../models/get-booking");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
/* ==========================================================================
* ADMIN: FETCH BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - bookingId: <string>
/* ========================================================================== */
const fetch_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { bookingId } = request.body;
    if (!bookingId) throw new Error("Missing Booking ID.");

    // Fetch Booking
    const booking = await getDocument("Bookings", bookingId);

    // Log Success
    logSuccess("admin_fetch_booking", "Successfully fetched booking.");

    // Send Response
    response.status(200).json(booking);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_booking:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_booking;
