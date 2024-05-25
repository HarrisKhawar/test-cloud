const { handlePublicRequest } = require("./handle-public-request");
const { getCollection } = require("../util/firestore/get-collection");
const { logError } = require("../util/logs/logging");

/* ==========================================================================
* FETCH All Vehicles
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
/* ========================================================================== */
const fetch_all_vehicles = async (request, response) => {
  try {
    if (handlePublicRequest(request, response)) return;

    // Fetch Subscription Plans
    const vehicles = await getCollection("Vehicles");

    // Remove private data
    vehicles.forEach((vehicle) => {
      vehicle.bookings = null;
      vehicle.license = null;
      vehicle.vin = null;
    });

    // Return
    response.status(200).json(vehicles);

    // Handle Error
  } catch (err) {
    logError("fetch_all_vehicles", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_all_vehicles;