const { addBooking } = require("../../util/bookings/add-booking");
const { constructBooking } = require("../../util/bookings/construct-booking");
const { applyCoupon } = require("../../util/coupons/apply-coupon");
const { useCoupon } = require("../../util/coupons/use-coupon");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");
const { logError } = require("../../util/logs/logging");
const {
  sendNotifications,
} = require("../../util/notifications/sendNotifications");
const { createPayment } = require("../../util/payments/create-payment");
const {
  updatePaymentBooking,
} = require("../../util/payments/update-payment-booking");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const { handleRequest } = require("../request-handling/handle-request");

/* ==========================================================================
 * CUSTOMER: ADD BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - vehicleId: <string>
    - period: <string>
    - code: <string>
    - paymentMethodId: <string>
    - delivery: <object>
        - pickup: <string>
        - dropoff: <string>
/* ========================================================================== */

const add_booking = async (request, response) => {
  try {
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { vehicleId, delivery, period, code, paymentMethodId } = request.body;

    if (!vehicleId) throw new Error("Missing Vehicle ID.");
    if (!period) throw new Error("Missing Period.");
    if (!paymentMethodId) throw new Error("Missing Payment Method.");
    if (period !== "weekly" && period !== "monthly")
      throw new Error("Invalid Period.");

    const customer = await getDocument("Customers", customerId);
    // Check Customer already has a booking
    if (customer.booking) throw new Error("You already have a booking.");

    // Check Drivers License
    if (
      !customer.drivers_license_front ||
      !customer.drivers_license_back ||
      customer.drivers_license_front === "" ||
      customer.drivers_license_back === ""
    )
      throw new Error("Please upload your drivers license to continue.");

    // Get Vehicle
    const vehicle = await getDocument("Vehicles", vehicleId);

    // Get Location
    const location = await getDocument("Locations", vehicle.location);

    // Check Availability
    if (vehicle.bookings?.length > 0)
      throw new Error("Vehicle is not available.");

    // Check Customer Plan
    if (!customer.plan?.active) throw new Error("No active subscription plan.");
    if (Number(customer.plan?.id) < Number(vehicle.plan?.id))
      throw new Error("Plan does not include vehicle. Please upgrade.");

    // Calculate Dates
    const startDate = new Date();
    let endDate = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (period === "weekly") endDate.setDate(startDate.getDate() + 7);
    else endDate = nextMonth;

    // Construct Price Object
    let price = {};

    // Calculate Price

    // Subtotal = Vehicle[Period] Rate
    price.subtotal = Number(vehicle.rates[period.toLowerCase()]).toFixed(2);
    // Tax = Subtotal * Location Tax
    price.tax = Number(Number(price.subtotal) * Number(location.tax)).toFixed(
      2
    );
    // Total = Subtotal + Tax
    price.total = Number(Number(price.subtotal) + Number(price.tax)).toFixed(2);
    price.total_days = period === "weekly" ? 7 : 30;

    // Apply Coupon
    if (code) {
      price = await applyCoupon({
        id: code,
        price,
        tax: Number(location.tax),
        customerId,
      });
    }

    // Calculate Miles
    let miles_included = location.miles[period.toLowerCase()];

    // Determine Pick Up and Drop Off
    let pickUp = vehicle.address;
    let dropOff = vehicle.address;
    if (delivery?.pickUp) {
      price.delivery = location.delivery.rate;
      price.total += location.delivery.rate;
      pickUp = delivery.pickUp;
    }
    if (delivery?.dropOff) {
      price.delivery
        ? (price.delivery += location.delivery.rate)
        : (price.delivery = location.delivery.rate);
      price.total += location.delivery.rate;
      dropOff = delivery.dropOff;
    }

    // Create Booking Object
    let booking = constructBooking(
      customer,
      vehicle,
      startDate,
      endDate,
      pickUp,
      dropOff,
      price,
      "0",
      "0",
      miles_included,
      vehicle.mileage_rate || "0.35"
    );

    // Create Description
    const description = `Booking for ${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.license}`;
    const metadata = {
      vehicleId: vehicle.id,
      customerId: customer.id,
    };

    // Create Payment
    const payment = await createPayment({
      customer,
      amount: price.total,
      taxes: price.tax,
      description,
      bookingId: false,
      paymentMethodId,
    });

    // Add Booking
    const bookingId = await addBooking(booking);

    // Update Payment Record
    await updatePaymentBooking({ bookingId, paymentId: payment.id });

    // Update Booking with Payment ID
    await updateDocument("Bookings", bookingId, {
      payment: {
        id: payment.id,
      },
      status: "confirmed",
    });

    // Update Coupon
    if (code) {
      await useCoupon({
        id: code,
        price,
        customerId,
      });
    }

    // Send Notification to Customer
    const message = `Your booking for ${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.license} has been confirmed.`;
    await sendNotifications({
      title: "Booking Confirmed",
      message: message,
      customer: customer,
    });

    // Send Slack Notification
    await sendSlackNotification(
      `${customer.firstName} ${customer.lastName} booked ${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.license} - ID: ${bookingId}`
    );

    response.status(200).json({ bookingId: bookingId });
  } catch (err) {
    logError("add_booking", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_booking;
