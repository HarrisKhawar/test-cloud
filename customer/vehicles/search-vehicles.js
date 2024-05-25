const { getCollection } = require("../../util/firestore/get-collection");
const { updateDocument } = require("../../util/firestore/update-document");
const { logError, logSuccess } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");

/* ==========================================================================
* CUSTOMER: SEARCH VEHICLES
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userid: <string>
    
* Request Body:
    - location: <string>
/* ========================================================================== */
const search_vehicles = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { location } = request.body;

    if (!location) throw new Error("Missing Location.");

    // Get Vehicles
    const vehicles = await getCollection("Vehicles");

    // Filter by location
    const locationVehicles = vehicles.filter(
      (vehicle) => vehicle.location === location && vehicle.status?.available
    );

    // Filter by booking
    let filteredVehicles = [];
    for (let vehicle of locationVehicles) {
      if (vehicle.bookings?.length > 0) continue;
      else filteredVehicles.push(vehicle);
    }

    // Remove private data
    filteredVehicles = filteredVehicles.map((vehicle) => {
      vehicle.bookings = null;
      vehicle.license = null;
      vehicle.vin = null;
      vehicle.insurance = null;
      vehicle.registration = null;

      return vehicle;
    });

    // Log Success
    logSuccess("search_vehicles", "Successfully searched vehicles.");

    // Send Response
    response.status(200).json(filteredVehicles);

    // Handle Error
  } catch (err) {
    logError("search_vehiles", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = search_vehicles;
