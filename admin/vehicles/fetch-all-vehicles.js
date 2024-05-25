const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH ALL VEHICLES
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_vehicles = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Fetch All Vehicles
    const vehicles = await getCollection("Vehicles");

    // Log Success
    logSuccess(
      "admin_fetch_all_vehicles",
      "Successfully fetched all vehicles."
    );

    // Send Response
    response.status(200).json(vehicles);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_all_vehicles:", err.message);
    response.status(500).send("Error fetching vehicles.");
  }
};

module.exports = fetch_all_vehicles;
