const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { startBooking } = require("../../util/bookings/start-booking");
const { createAgreement } = require("../../util/bookings/create-agreement");
const { getDocument } = require("../../util/firestore/get-document");
/* ==========================================================================
* ADMIN: FORCE AGREEMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - bookingId: <string>
/* ========================================================================== */
const force_agreement = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { bookingId } = request.body;
    if (!bookingId) throw new Error("Missing Booking ID.");

    const booking = await getDocument("Bookings", bookingId);
    const customer = await getDocument("Customers", booking.customer.id);
    const vehicle = await getDocument("Vehicles", booking.vehicle.id);

    // Format Booking Dates
    booking.start_date = booking.start_date.toDate();
    booking.end_date = booking.end_date.toDate();

    const url = await createAgreement(booking, customer, vehicle);

    // Send Response
    response.status(200).json({ url });

    // Handle Error
  } catch (err) {
    logError("admin_force_agreement:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = force_agreement;
