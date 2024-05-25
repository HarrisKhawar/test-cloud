const { handlePublicRequest } = require("./handle-public-request");
const { getCollection } = require("../util/firestore/get-collection");
const { logError } = require("../util/logs/logging");
const { constructDateObject } = require("../util/tools/construct-date-object");
const {
  checkVehicleAvailability,
} = require("../util/vehicles/check-vehicle-availability");

/* ==========================================================================
* FETCH Vehicles
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>

* Request Body:
    - start_date: <string>
    - start_time: <string>
    - end_date: <string>
    - end_time: <string>
    - location: <string>
    - plan: <string> (optional)
/* ========================================================================== */
const fetch_vehicles = async (request, response) => {
  try {
    if (handlePublicRequest(request, response)) return;

    // Confirm Required Fields
    const { start_date, start_time, end_date, end_time, location, plan } =
      request.body;
    if (!start_date || !start_time || !end_date || !end_time || !location) {
      throw new Error("Missing required fields.");
    }

    // Fetch Subscription Plans
    const vehicles = await getCollection("Vehicles");

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

    // Filter Vehicles By Availability
    let availableVehicles = [];
    vehicles.forEach((vehicle) => {
      if (
        checkVehicleAvailability(startDate, endDate, vehicle) &&
        vehicle.location === location
      ) {
        // Remove private data
        vehicle.bookings = null;
        vehicle.license = null;
        vehicle.vin = null;
        vehicle.insurance = null;
        vehicle.registration = null;

        // Add to available vehicles
        availableVehicles.push(vehicle);
      }
    });

    // Filter Vehicles By Plan
    if (plan) {
      availableVehicles = availableVehicles.filter(
        (vehicle) => vehicle.plan?.name.toLowerCase() === plan.toLowerCase()
      );
    }

    // Return
    response.status(200).json(availableVehicles);

    // Handle Error
  } catch (err) {
    logError("fetch_vehicles", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_vehicles;
