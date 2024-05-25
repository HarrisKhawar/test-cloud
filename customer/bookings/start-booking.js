const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { startBooking } = require("../../util/bookings/start-booking");
const admin = require("firebase-admin");
const { getDocument } = require("../../util/firestore/get-document");
const { createAgreement } = require("../../util/bookings/create-agreement");
const { updateDocument } = require("../../util/firestore/update-document");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const splitAddress = require("../../util/tools/splitAddress");
const {
  checkDateFormat,
  checkDatePassed,
} = require("../../util/tools/checkDate");

/* ==========================================================================
* CUSTOMER: START BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userid: <string>
    
* Request Body:
    - bookingId: <string>
    - images: <array>
    - signature: <string>
    - base64Signature: <string>
    - time: <Date Object>
    - mileage: <number>
    - fuel: <number>
    - drivers_license_number: <string>
    - drivers_license_exp: <string>
    - dob: <string>
    - address: <string>
/* ========================================================================== */
const start_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const {
      bookingId,
      time,
      images,
      signature,
      base64Signature,
      mileage,
      fuel,
    } = request.body;

    if (!bookingId) throw new Error("Missing Booking ID.");
    if (!time) throw new Error("Missing Time.");
    if (!images) throw new Error("Missing Images.");
    if (!signature && !base64Signature) throw new Error("Missing Signature.");

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
    if (booking.status === "active" || booking.status === "completed")
      throw new Error("Booking is already active or completed.");

    // Check unpaid invoices
    if (customer.unpaid_invoices)
      throw new Error("Please clear unpaid invoices before checking in.");

    if (!customer.drivers_license_number)
      throw new Error("Missing Drivers License Information.");

    // Format Booking Dates
    booking.start_date = booking.start_date.toDate();
    booking.end_date = booking.end_date.toDate();

    // Add Signature to Customer Object
    let customerUpdate = {};
    if (base64Signature) {
      const path = `users/${customerId}/signature.png`;
      const bucket = admin.storage().bucket();
      const file = bucket.file(path);
      const buffer = Buffer.from(base64Signature, "base64");
      await file.save(buffer, {
        metadata: { contentType: "image/png" },
      });
      const url = await file.getSignedUrl({
        action: "read",
        expires: "03-17-2026",
      });
      customer.signature = url[0];
      customerUpdate.signature = url[0];
    } else {
      customer.signature = signature;
      customerUpdate.signature = signature;
    }

    // Update Customer
    await updateDocument("Customers", customerId, customerUpdate);

    // Get Rental Agreement URL
    const agreementURL = await createAgreement(booking, customer, vehicle);

    // Update Booking with Agreement URL
    booking.agreement = agreementURL;
    booking.check_in_images = images;

    const bookingUpdate = {
      agreement: agreementURL,
      start_mileage: mileage || booking.start_mileage,
      start_fuel: fuel || booking.start_fuel,
      check_in_images: images,
      status: "active",
    };
    await updateDocument("Bookings", bookingId, bookingUpdate);

    // Send Notification
    await sendSlackNotification(
      `${customer.firstName} ${customer.lastName} completed check in for ${vehicle.make} ${vehicle.model} ${vehicle.year} (${vehicle.license})`
    );

    // Send Response
    response.status(200).json(booking);

    // Handle Error
  } catch (err) {
    logError("start_booking:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = start_booking;
