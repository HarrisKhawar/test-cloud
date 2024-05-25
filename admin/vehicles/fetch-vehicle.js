const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getVehicle } = require("../../models/get-vehicle");
const { getDocument } = require("../../util/firestore/get-document");
/* ==========================================================================
* ADMIN: FETCH VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - id: <string>
/* ========================================================================== */
const fetch_vehicle = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { id } = request.body;
    if (!id) throw new Error("Missing Vehicle ID.");

    // Fetch Vehicle
    const vehicle = await getDocument("Vehicles", id);

    // Log Success
    logSuccess(
      "admin_fetch_vehicle",
      "Successfully fetched vehicle: " + id + ""
    );

    // Send Response
    response.status(200).json(vehicle);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_vehicle:", err.message);
    response.status(500).send("Error fetching vehicle.");
  }
};

module.exports = fetch_vehicle;
