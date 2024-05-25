const { logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { handleRequest } = require("../request-handling/handle-request");
const { documentExists } = require("../../util/firestore/document-exists");
const {
  constructDateObject,
} = require("../../util/tools/construct-date-object");
const { calculatePrice } = require("../../util/tools/calculate-price");
const { constructBooking } = require("../../util/bookings/construct-booking");
const { addBooking } = require("../../util/bookings/add-booking");
const {
  checkVehicleAvailability,
} = require("../../util/vehicles/check-vehicle-availability");
const {
  createPaymentIntent,
} = require("../../util/stripe/create-payment-intent");
const { handleResponse } = require("../request-handling/handle-response");

/* ==========================================================================
 * CUSTOMER: CREATE BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - vehicleId: <string>
    - start_date: <string>
    - end_date: <string>
    - start_time: <string>
    - end_time: <string>
    - pick_up_address: <string>
    - drop_off_address: <string>
    - promo: <string>
    - payment_method_id: <string>
/* ========================================================================== */
const create_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const {
      vehicleId,
      start_date,
      start_time,
      end_time,
      end_date,
      pick_up_address,
      drop_off_address,
      promo,
      payment_method_id,
    } = request.body;
    if (!vehicleId) throw new Error("Missing Vehicle ID.");
    if ((!start_date, !start_time, !end_time, !end_date))
      throw new Error("Missing Booking Dates.");
    if (!payment_method_id) throw new Error("Missing Payment Method.");

    // Check Customer Exists
    if (!(await documentExists("Customers", customerId)))
      throw new Error("Customer does not exist.");

    // Check Vehicle Exists
    if (!(await documentExists("Vehicles", vehicleId)))
      throw new Error("Vehicle does not exist.");

    // Get Customer
    const customer = await getDocument("Customers", customerId);

    // Check Customer already has a booking
    if (customer.booking) throw new Error("Customer already has a booking.");

    // Get Vehicle
    const vehicle = await getDocument("Vehicles", vehicleId);

    // Construct Date Objects
    const startDate = constructDateObject(start_date, start_time);
    const endDate = constructDateObject(end_date, end_time);

    // Verify Dates
    if (startDate >= endDate) {
      throw new Error("Start date must be before end date.");
    }
    // Check if dates are a week apart
    if (endDate - startDate < 604800000) {
      throw new Error(
        "Due to high demand, bookings must be at least a week long. For more information, please contact support."
      );
    }

    // Check Vehicle Availability
    if (!checkVehicleAvailability(startDate, endDate, vehicle))
      throw new Error("Vehicle is not available for these dates.");

    // Calculate Price
    const tempPrice = await calculatePrice(
      startDate,
      endDate,
      vehicle.rates,
      pick_up_address,
      drop_off_address,
      promo
    );

    // Adjust Price according to customer plan
    let price = {};
    if (
      customer.plan?.active &&
      customer.plan?.name.toLowerCase() === vehicle.plan.name.toLowerCase()
    ) {
      price.total = tempPrice.total_discounted;
      price.booking = tempPrice.booking_discounted;
      price.delivery = tempPrice.delivery;
      price.taxes = tempPrice.taxes_discounted;
      price.total_days = tempPrice.days;
    } else {
      price.total = tempPrice.total;
      price.booking = tempPrice.booking;
      price.delivery = tempPrice.delivery;
      price.taxes = tempPrice.taxes;
      price.total_days = tempPrice.days;
    }

    // Construct Booking Object
    const booking = constructBooking(
      customer,
      vehicle,
      startDate,
      endDate,
      pick_up_address || vehicle.address,
      drop_off_address || vehicle.address,
      price
    );

    // Create Description
    const description = `Booking for ${vehicle.make} ${vehicle.model} ${vehicle.license}`;

    // Create Metadata
    const metadata = {
      customerId: customerId,
      vehicleId: vehicleId,
      start_date: start_date,
      end_date: end_date,
      start_time: start_time,
      end_time: end_time,
    };

    // Charge Customer
    const payment = await createPaymentIntent(
      customer,
      price.total,
      description,
      payment_method_id,
      metadata
    );

    // Update Booking Status
    booking.status = "confirmed";
    booking.paymentId = payment.id;

    // Add Booking
    const bookingId = await addBooking(booking);

    // Handle Response
    handleResponse(request, "create_booking", "Booking Added" + bookingId);

    // Return Response
    response.status(200).send(bookingId);

    // Handle Error
  } catch (err) {
    logError("create_booking:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = create_booking;
