const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");

/* ==========================================================================
* ADMIN: FETCH CHARGING FOR BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - bookingId: <string>
/* ========================================================================== */
const fetch_booking_charging = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { bookingId } = request.body;
    if (!bookingId) throw new Error("Missing Booking ID.");

    // Get Booking
    const booking = await getDocument("Bookings", bookingId);

    // Get Vehicle
    const vehicle = await getDocument("Vehicles", booking.vehicle.id);

    // Check Vehicle is EV
    if (vehicle.fuel !== "Electric") {
        throw new Error("Vehicle is not an EV.");
    }

    // Get Tolls
    let charging = [];

    // Check if Booking has tolls
    if (booking.charging?.length > 0) {
      // Fetch those tolls
      for (const charge of booking.charging) {
        const chargeDoc = await getDocument("Charging", charge.id);
        charging.push(chargeDoc);
      }
    } else {
      // Fetch All Tolls
      const allChargings = await getCollection("Charging");

      // Get Booking Dates
      const startDate = booking.start_date.toDate();
      const endDate = booking.end_date.toDate();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // Filter All Tolls
      allChargings.forEach((charge) => {
        const chargeDate = new Date(charge["ChargeStartDateTime"]);
        if (
          chargeDate >= startDate &&
          chargeDate <= endDate &&
          charge.vehicle?.id === vehicle.id
        ) {
          charging.push(charge);
        }
      });

      // If booking is completed add tolls to booking
      if (booking.status === "completed") {
        // Update Booking
        await updateDocument("Bookings", bookingId, {
          charging: charging,
        });
      }
    }

    // Log Success
    logSuccess("admin_fetch_booking_charging", "Successfully fetched all charging.");

    // Send Response
    response.status(200).json(charging);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_booking_charging", err.message);
    response.status(500).send("Error fetching tolls.");
  }
};

module.exports = fetch_booking_charging;
