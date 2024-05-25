const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { startBooking } = require("../../util/bookings/start-booking");
const { updateDocument } = require("../../util/firestore/update-document");
/* ==========================================================================
* ADMIN: START BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - bookingId: <string>
    - start_mileage: <string>
    - start_fuel: <string>
    - status: <string>
    - check_in_images: <array>
/* ========================================================================== */
const start_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { bookingId, start_mileage, start_fuel, check_in_images, status } =
      request.body;
    if (!bookingId || !start_mileage || !start_fuel || !check_in_images || !status)
      throw new Error("Missing Required Fields.");

    // Update Document
    await updateDocument("Bookings", bookingId, {
      start_mileage: start_mileage,
      start_fuel: start_fuel,
      check_in_images_admin: check_in_images,
      status: status,
    });

    // Complete Booking
    await startBooking(bookingId);

    // Send Response
    response.status(200).send(bookingId);

    // Handle Error
  } catch (err) {
    logError("admin_start_booking:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = start_booking;
