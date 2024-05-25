const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const { completeBooking } = require("../../util/bookings/complete-booking");

/* ==========================================================================
* CUSTOMER: END BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userid: <string>
    
* Request Body:
    - bookingId: <string>
    - images: <array>
    - time: <Date Object>
    - mileage: <number>
    - fuel: <number>
/* ========================================================================== */
const end_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { bookingId, time, images, mileage, fuel } = request.body;

    if (!bookingId) throw new Error("Missing Booking ID.");
    if (!time) throw new Error("Missing Time.");
    if (!images) throw new Error("Missing Images.");

    // Get Booking Object
    const booking = await getDocument("Bookings", bookingId);

    // Get Customer Object
    const customer = await getDocument("Customers", customerId);

    // Get Vehicle Object
    const vehicle = await getDocument("Vehicles", booking.vehicle.id);

    // Check Booking Belongs to User
    if (booking.customer.id !== customerId)
      throw new Error("Booking does not belong to user.");

    // Check Booking Status
    if (booking.status === "completed")
      throw new Error("Booking is already completed.");

    // Add Images
    booking.check_out_images = images;
    await updateDocument("Bookings", bookingId, {
      check_out_images: images,
      end_mileage: mileage || "",
      end_fuel: fuel || "",
    });

    // Complete Booking
    await completeBooking(bookingId);

    // Send Notification
    await sendSlackNotification(
      `${customer.firstName} ${customer.lastName} checked out ${vehicle.make} ${vehicle.model} ${vehicle.year} (${vehicle.license})`
    );

    // Send Response
    response.status(200).json(booking);

    // Handle Error
  } catch (err) {
    logError("end_booking:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = end_booking;
