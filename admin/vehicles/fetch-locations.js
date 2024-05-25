const { handleRequest } = require("../request-handling/handle-request");
const { getDocument } = require("../../util/firestore/get-document");
const { reverseGeocoding } = require("../../util/tools/reverse-geocoding");
const { logSuccess, logError } = require("../../util/logs/logging");
const getLocations = require("../../util/linxup/get-locations");

/* ==========================================================================
* ADMIN: FETCH LOCATIONS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Headers:
  vins: <array>
    
/* ========================================================================== */
const fetch_locations = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { vins } = request.body;
    if (!vins || vins.length < 1) throw new Error("Missing VINs");

    // Get Locations
    const data = await getLocations();
    const locations = data.data?.locations;
    if (!locations || locations.length === 0)
      throw new Error("No vehicle locations found.");

    // Get Addresses
    const result = await Promise.all(
      vins.map(async (vin) => {
        const location = locations.find((loc) => loc.vin === vin);
        if (!location) return { vin, address: "Tracker not installed" };
        location.address = await reverseGeocoding(
          location.latitude,
          location.longitude
        );
        return location;
      })
    );

    logSuccess(
      "admin-fetch-locations",
      "Successfully fetched vehicle locations."
    );

    // Send Response
    response.status(200).json(result);

    // Handle Error
  } catch (err) {
    logError("admin-fetch-locations:", err.message);
    response.status(500).send("Error fetching vehicle locations.");
  }
};

module.exports = fetch_locations;
