// Import Admin Utilities
const { calculatePrice } = require("../util/admin-calculate-price");

// Import Utilities
const { handleRequest } = require("../request-handling/handle-request");
const { getDocument } = require("../../util/firestore/get-document");
const { constructBooking } = require("../../util/bookings/construct-booking");
const {
  checkVehicleAvailability,
} = require("../../util/vehicles/check-vehicle-availability");
const {
  constructDateObject,
} = require("../../util/tools/construct-date-object");
const { addBooking } = require("../../util/bookings/add-booking");
const { format } = require("date-fns");
const { updateDocument } = require("../../util/firestore/update-document");
const { logSuccess, logError } = require("../../util/logs/logging");

// Import API Calls
const { createInvoice } = require("../../util/payments/create-invoice");
const {
  createPaymentIntent,
} = require("../../util/stripe/create-payment-intent");
const { sendMessage } = require("../../util/twilio/send-message");

/* ==========================================================================
* ADMIN: CREATE BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    vehicleId: <string>
    customerId: <string>
    start_date: <string> (YYYY-MM-DD)
    end_date: <string> (YYYY-MM-DD)
    start_time: <string> (HH:MM:SS)
    end_time: <string> (HH:MM:SS)
    pick_up_location: <string>
    drop_off_location: <string>
    start_mileage: <number>
    start_fuel: <number>
    miles_included: <number>
    mileage_rate: <number>
    booking_fee: <string>
    delivery_fee: <string>
    taxes: <string>
    recurring: <boolean>
    frequency: <string> "weekly" | "monthly"
    charge: <string> "now" | "invoice" | "none"
    payment_method_id: <string>
    days_until_due: <string>
    status: <string> "pending" | "confirmed" | "cancelled" | "completed"
/* ========================================================================== */
const create_booking = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Extrapolate Request Body
    const body = request.body;
    const vehicleId = body.vehicleId;
    const customerId = body.customerId;
    const start_date = body.start_date;
    const end_date = body.end_date;
    const start_time = body.start_time;
    const end_time = body.end_time;
    const pick_up_location = body.pick_up_location;
    const drop_off_location = body.drop_off_location;
    const start_mileage = body.start_mileage;
    const start_fuel = body.start_fuel;
    const miles_included = body.miles_included;
    const mileage_rate = body.mileage_rate;
    const booking_fee = body.booking_fee;
    const delivery_fee = body.delivery_fee;
    const taxes = body.taxes;
    const recurring = body.recurring;
    const frequency = body.frequency;
    const charge = body.charge;
    const days_until_due = body.days_until_due;
    const status = body.status;
    const payment_method_id = body.payment_method_id;

    // Validate Request Body
    if (!vehicleId || !customerId)
      throw new Error("Missing Vehicle ID or Customer ID");
    if (recurring && !frequency)
      throw new Error("Missing Frequency for Recurring Charge");
    if (charge === "now" && !payment_method_id)
      throw new Error("Missing Payment Method ID");
    if (charge === "invoice" && !days_until_due)
      throw new Error("Missing Days Until Due");
    if (charge === "none" && !status) throw new Error("Missing Booking Status");
    if (!start_date || !end_date)
      throw new Error("Missing Start Date or End Date");
    if (!start_time || !end_time)
      throw new Error("Missing Start Time or End Time");
    if (!pick_up_location || !drop_off_location)
      throw new Error("Missing Pick Up Location or Drop Off Location");
    if (!start_mileage || !start_fuel)
      throw new Error("Missing Start Mileage or Start Fuel");
    if (!miles_included) throw new Error("Missing Miles Included");
    if (!mileage_rate) throw new Error("Missing Mileage Rate");
    if (!booking_fee || !taxes || !delivery_fee)
      throw new Error("Missing Booking Fee, Delivery Fee, or Taxes");

    // Get User Data
    const customer = await getDocument("Customers", customerId);

    // Check if User has a booking
    if (customer.booking) throw new Error("Customer already has a booking.");
    if (!customer.drivers_license_number)
      throw new Error("Missing Customer Drivers License Number");
    if (!customer.phone) throw new Error("Missing Customer Phone Number");
    if (!customer.dob) throw new Error("Missing Customer Date of Birth");
    if (!customer.address) throw new Error("Missing Customer Address");

    // Get Vehicle Data
    const vehicle = await getDocument("Vehicles", vehicleId);

    // Check Vehicle Status
    if (!vehicle.status?.available)
      throw new Error("Vehicle is marked unavailable.");

    // If User does not have a plan add plan for the booking only
    if (!customer.plan) {
      customer.plan = {
        id: vehicle.plan.id,
        active: false,
        name: vehicle.plan.name,
        date_created: new Date(),
        start_date: new Date(),
        end_date: new Date(),
        renewal_date: new Date(),
        subscriptionId: null,
        trial: true,
      };
    }

    // Create Date Objects
    const startDate = constructDateObject(start_date, start_time);
    const endDate = constructDateObject(end_date, end_time);

    // Check if start date is before end date
    if (startDate >= endDate) throw new Error("Start date is after end date.");

    // Check Vehicle is available
    if (!checkVehicleAvailability(startDate, endDate, vehicle))
      throw new Error(
        `Vehicle is not available for: ${startDate} - ${endDate}`
      );

    // Calculate Price
    const price = calculatePrice(
      booking_fee,
      delivery_fee,
      taxes,
      startDate,
      endDate
    );

    // Construct Booking Object
    const booking = constructBooking(
      customer,
      vehicle,
      startDate,
      endDate,
      pick_up_location,
      drop_off_location,
      price,
      start_mileage,
      start_fuel,
      miles_included,
      mileage_rate
    );

    // Create Description for Booking
    const description = `Booking for ${vehicle.make} ${vehicle.model} ${
      vehicle.license
    } (${format(startDate, "MMM do, yyyy hh:mm a")} to ${format(
      endDate,
      "MMM do, yyyy hh:mm a"
    )})`;

    // Create Metadata for Stripe
    const metadata = {
      customerId: customerId,
      vehicleId: vehicleId,
      start_date: start_date,
      end_date: end_date,
      start_time: start_time,
      end_time: end_time,
    };

    let bookingId = "";

    // If Charge Customer Now
    if (charge === "now") {
      // Charge Customer
      const payment = await createPaymentIntent(
        customer,
        price.total,
        description,
        payment_method_id,
        metadata
      );

      // Add booking object
      bookingId = await addBooking(booking);

      // Update Booking and Payment Status
      await updateDocument("Bookings", bookingId, {
        status: "confirmed",
        payment: {
          id: payment.id,
          status: "succeeded",
        },
      });

      // Update Payment Object
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

      // Send SMS to Customer
      const message = `Your booking for ${vehicle.make} ${vehicle.model} ${vehicle.license} 
      from ${start_date} to ${end_date} is confirmed. Please check in by logging in to your 
      POSH account: https://poshcars.io/dashboard/booking`;
      await sendMessage(message, customer.phone);
    } else if (charge === "invoice") {
      // Add Booking to Database
      bookingId = await addBooking(booking);

      // Create Invoice
      const invoice = {
        customer: customer,
        days_until_due: days_until_due,
        taxes: price.taxes,
        amount: price.total,
        description: description,
        items: [
          {
            description: description,
            amount: Number(price.total - price.taxes).toFixed(2),
          },
        ],
        bookingId: bookingId,
      };

      // Send Invoice
      const payment = await createInvoice(
        customer,
        days_until_due,
        price.total,
        price.taxes,
        description,
        bookingId
      );

      // Update Booking Payment
      await updateDocument("Bookings", bookingId, {
        status: "confirmed",
        payment: {
          id: payment.id,
          status: "pending",
        },
      });

      // Send SMS to Customer
      const message = `Your booking for ${vehicle.make} ${vehicle.model} ${vehicle.license} 
      from ${start_date} to ${end_date} has a pending invoice. Please click on the following link
      to pay: https://poshcars.io/dashboard`;
      await sendMessage(message, customer.phone);
    } else {
      // Add Booking to Database
      bookingId = await addBooking(booking);

      // Update Booking Payment
      await updateDocument("Bookings", bookingId, {
        status: status || "confirmed",
      });

      // Send SMS to Customer
      const message = `Your booking for ${vehicle.make} ${vehicle.model} ${vehicle.license} 
      from ${start_date} to ${end_date} is confirmed. Please check in by logging in to your 
      POSH account: https://poshcars.io/dashboard/booking`;
      await sendMessage(message, customer.phone);
    }

    // Log Success
    logSuccess("Booking Created - ID", bookingId);

    // Send Response
    response.status(200).json({ bookingId: bookingId });
  } catch (err) {
    logError("Error in admin-create-booking", [err.message]);
    response.status(500).send(err.message);
  }
};

module.exports = create_booking;
