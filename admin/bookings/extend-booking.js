const { handleRequest } = require("../request-handling/handle-request");
const { getBooking } = require("../../models/get-booking");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const {
  constructDateObject,
} = require("../../util/tools/construct-date-object");
const { updateDocument } = require("../../util/firestore/update-document");
const {
  createPaymentIntent,
} = require("../../util/stripe/create-payment-intent");
const { extendBooking } = require("../../util/bookings/extend-booking");
const { createInvoice } = require("../../util/payments/create-invoice");
const { sendMessage } = require("../../util/twilio/send-message");
const { format } = require("date-fns");
const { createAgreement } = require("../../util/bookings/create-agreement");
/* ==========================================================================
* ADMIN: EXTEND BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - bookingId: <string>
    - customerId: <string>
    - end_date: <string> (YYYY-MM-DD)
    - end_time: <string> (HH:MM:SS)
    - drop_off_location: <string>
    - miles_included: <number>
    - mileage_rate: <number>
    - booking_fee: <string>
    - taxes: <string>
    - charge: <string> "now" | "invoice" | "none"
    - payment_method_id: <string>
    - days_until_due: <string>
/* ========================================================================== */
const extend_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const {
      bookingId,
      customerId,
      end_date,
      end_time,
      drop_off_location,
      miles_included,
      mileage_rate,
      booking_fee,
      taxes,
      charge,
      payment_method_id,
      days_until_due,
    } = request.body;
    if (!bookingId) throw new Error("Missing Booking ID.");
    if (!customerId) throw new Error("Missing Customer ID.");
    if (!end_date) throw new Error("Missing End Date.");
    if (!end_time) throw new Error("Missing End Time.");
    if (!drop_off_location) throw new Error("Missing Drop Off Location.");
    if (!miles_included) throw new Error("Missing Miles Included.");
    if (!mileage_rate) throw new Error("Missing Mileage Rate.");
    if (!booking_fee) throw new Error("Missing Booking Fee.");
    if (!taxes) throw new Error("Missing Taxes.");
    if (!charge) throw new Error("Missing Charge.");

    // Fetch Booking
    const booking = await getDocument("Bookings", bookingId);

    // Fetch Customer
    const customer = await getDocument("Customers", customerId);

    // Get Vehicle Object
    const vehicle = await getDocument("Vehicles", booking.vehicle.id);

    // Create Date Object
    const endDate = constructDateObject(end_date, end_time);

    const extension = {
      date: new Date(),
      end_date: endDate,
      drop_off_location: drop_off_location,
      miles_included: miles_included,
      mileage_rate: mileage_rate,
      booking_fee: booking_fee,
      taxes: taxes,
      total: Number(booking_fee) + Number(taxes),
    };

    // Create Description for Extension
    const description = `Booking Extension for ${booking.vehicle.make} ${
      booking.vehicle.model
    } ${booking.vehicle.license} to ${format(endDate, "MMM do, yyyy hh:mm a")}`;

    // Create Metadata for Stripe
    const metadata = {
      customerId: customerId,
      vehicleId: booking.vehicle.id,
      end_date: end_date,
      end_time: end_time,
      bookingId: bookingId,
    };

    let payment = {
      id: "",
      status: "not_charged",
    };

    if (charge === "now") {
      payment = await createPaymentIntent(
        customer,
        extension.total,
        description,
        payment_method_id,
        metadata
      );

      await updateDocument("Payments", payment.id, {
        booking: {
          id: bookingId,
          start_date: booking.start_date,
          end_date: booking.end_date,
        },
        vehicle: {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          image: vehicle.images.corner,
        },
      });
    } else if (charge === "invoice") {

      payment = await createInvoice(
        customer,
        days_until_due,
        extension.total,
        extension.taxes,
        description,
        bookingId
      );
      const message = `You have a new invoice of $${extension.total} for "${description}".`;
      await sendMessage(message, customer.phone);
    }

    // Extend Booking
    await extendBooking(booking, extension, payment);

    // Send SMS to Customer
    const message = `Your booking for ${booking.vehicle.make} ${
      booking.vehicle.model
    } ${booking.vehicle.license} has been changed to end on ${format(
      endDate,
      "MMM do, yyyy hh:mm a"
    )}.`;
    await sendMessage(message, customer.phone);

    // Update Agreement
    const newBooking = await getDocument("Bookings", bookingId);
    newBooking.start_date = newBooking.start_date.toDate();
    newBooking.end_date = newBooking.end_date.toDate();
    const agreement = await createAgreement(newBooking, customer, vehicle);
    await updateDocument("Bookings", bookingId, {
      agreement: agreement,
    });

    // Log Success
    logSuccess("admin_extend_booking", "Successfully extended booking.");

    // Send Response
    response.status(200).json(extension);

    // Handle Error
  } catch (err) {
    logError("admin_extend_booking:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = extend_booking;
