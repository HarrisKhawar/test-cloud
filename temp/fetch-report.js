const { handleRequest } = require("../admin/request-handling/handle-request");
const { logSuccess, logError } = require("../util/logs/logging");
const { getDocument } = require("../util/firestore/get-document");
const getStatistics = require("../../util/samsara/vehicles/get-statistics");
const getLocations = require("../../util/samsara/vehicles/get-locations");
/* ==========================================================================
* ADMIN: FETCH VEHICLE REPORT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - id: <string>
/* ========================================================================== */
const fetch_report = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { id } = request.body;
    if (!id) throw new Error("Missing Vehicle ID.");

    // Fetch Vehicle
    const vehicle = await getDocument("Vehicles", id);
    if (!vehicle.samsaraId)
      throw new Error("Vehicle not connected to Samsara.");

    const result1 = await getStatistics([vehicle.samsaraId]);
    const stats = result1?.data[0];
    const result2 = await getLocations([vehicle.samsaraId]);
    const location = result2?.data[0];
    if (!location && !stats) throw new Error("Vehicle is offline. Visit Samsara Dashboard.");

    const data = {
      id: stats?.id || location?.id,
      serial: stats?.externalIds?.["samsara.serial"] || location?.externalIds?.["samsara.serial"] || location.name,
      fuel: stats?.fuelPercent.value,
      longitude: location?.location.longitude,
      latitude: location?.location.latitude,
      speed: location?.location.speed?.toFixed(0) || "0",
      address: location?.location.reverseGeo.formattedLocation,
    };
    if (stats?.obdOdometerMeters) data.mileage = stats?.obdOdometerMeters?.value;
    else data.mileage = stats?.gpsDistanceMeters?.value;
    // Meteres to miles
    data.mileage = (data.mileage * 0.000621371).toFixed(0);

    // Send Response
    response.status(200).json(data);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_vehicle_report", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_report;
