const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH VEHICLE REVENUE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - vehicles: <array>
    - year: <string>
/* ========================================================================== */
const fetch_vehicle_revenue = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    const { vehicles, year } = request.body;

    // Confirm required fields
    if (!vehicles || vehicles.length < 1) {
      return response.status(400).send("No Vehicles Requested.");
    }

    // Fetch All Payments
    const payments = await getCollection("Payments");

    // Create Revenue Array
    let months = [];

    // Loop over payments
    payments.forEach((payment) => {
      // Determine vehicle id from payment
      const vehicleId = payment.vehicle?.id || payment.metadata?.vehicleId;
      if (!vehicleId) return;

      // Check if payment is from this year
      if (payment.date_created.toDate().getFullYear() !== Number(year)) return;

      // Get Payment Month
      const month = payment.date_created.toDate().getMonth();

      // If Vehicles include vehicleId
      if (vehicles.includes(vehicleId)) {
        // If Payment was succeeded
        if (payment.status === "succeeded") {
          // Add to vehicle's month revenue
          months[month] = months[month] || {};
          months[month].revenue = months[month].revenue || 0;
          months[month].revenue += Number(payment.amount);
          months[month].name = payment.date_created
            .toDate()
            .toLocaleString("default", { month: "short" });
        }
      }
    });

    months.forEach((month) => {
      month.revenue = month.revenue.toFixed(2);
    });

    logSuccess("admin_get_vehicle_stats", "Successfully fetched vehicle stats");

    // Send Response
    response.status(200).json(months);

    // Handle Error
  } catch (err) {
    logError("admin_get_vehicle_stats", err.message);
    response.status(500).send("Error getting vehicle stats");
  }
};

module.exports = fetch_vehicle_revenue;
