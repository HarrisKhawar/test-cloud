const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");

/* ==========================================================================
* ADMIN: FETCH TOLLS FOR BOOKING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - bookingId: <string>
/* ========================================================================== */
const fetch_booking_tolls = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { bookingId } = request.body;
    if (!bookingId) throw new Error("Missing Booking ID.");

    // Get Booking
    const booking = await getDocument("Bookings", bookingId);

    // Get Tolls
    let tolls = [];

    // Check if Booking has tolls
    if (booking.tolls?.length > 0) {
      // Fetch those tolls
      for (const toll of booking.tolls) {
        const tollDoc = await getDocument("Tolls", toll.id);
        tolls.push(tollDoc);
      }
    } else {
      // Fetch All Tolls
      const allTolls = await getCollection("Tolls");

      // Get Vehicle
      const vehicle = await getDocument("Vehicles", booking.vehicle.id);

      // Get Booking Dates
      const startDate = booking.start_date.toDate();
      const endDate = booking.end_date.toDate();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // Filter All Tolls
      allTolls.forEach((toll) => {
        const tollDate = new Date(toll["Tolled At"]);
        if (
          tollDate >= startDate &&
          tollDate <= endDate &&
          toll.vehicle?.id === vehicle.id
        ) {
          tolls.push(toll);
        }
      });

      // If booking is completed add tolls to booking
      if (booking.status === "completed") {
        // Update Booking
        await updateDocument("Bookings", bookingId, {
          tolls: tolls,
        });
      }
    }

    // Log Success
    logSuccess("admin_fetch_booking_tolls", "Successfully fetched all tolls.");

    // Send Response
    response.status(200).json(tolls);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_booking_tolls", err.message);
    response.status(500).send("Error fetching booking tolls.");
  }
};

module.exports = fetch_booking_tolls;
