const FieldValue = require("firebase-admin").firestore.FieldValue;
const { handleRequest } = require("../request-handling/handle-request");
const { logError, logSuccess } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");
const {
  setSubcollectionDocument,
} = require("../../util/firestore/set-subcollection-document");
/* ==========================================================================
* ADMIN: CANCEL BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - bookingId: <string>
/* ========================================================================== */
const cancel_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { bookingId } = request.body;
    if (!bookingId) throw new Error("Missing Booking ID.");

    const booking = await getDocument("Bookings", bookingId);
    const customer = await getDocument("Customers", booking.customer.id);
    const vehicle = await getDocument("Vehicles", booking.vehicle.id);

    if (booking.status === "active" || booking.status === "completed")
      throw new Error("Only upcoming bookings can be cancelled.");

    // Update Booking Status
    await updateDocument("Bookings", bookingId, {
      status: "cancelled",
      cancelled_date: new Date(),
    });

    // Update Customer Object
    if (customer.booking?.id === bookingId)
      await updateDocument("Customers", booking.customer.id, {
        booking: FieldValue.delete(),
      });

    // Update Vehicle Record
    const bookingRecord = vehicle.bookings?.find(
      (booking) => booking.id === bookingId
    );

    // Delete Booking from Vehicle
    await updateDocument("Vehicles", booking.vehicle.id, {
      bookings: FieldValue.arrayRemove(bookingRecord),
    });
    
    logSuccess("admin-cancel-booking", bookingId);

    // Send Response
    response.status(200).send(bookingId);

    // Handle Error
  } catch (err) {
    logError("admin-cancel-booking", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = cancel_booking;
