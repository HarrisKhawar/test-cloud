const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const {
  getSubcollectionDocument,
} = require("../../util/firestore/get-subcollection-document");
/* ==========================================================================
 * PARTNER: FETCH VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - vin: <string>
/* ========================================================================== */
const fetch_vehicle = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const { vin } = request.body;
    if (!vin) throw new Error("Missing required VIN");

    // Fetch Customer
    const vehicle = await getSubcollectionDocument(
      "Partners",
      partnerId,
      "Vehicles",
      vin
    );

    // Send Response
    response.status(200).json(vehicle);

    // Handle Error
  } catch (err) {
    logError("fetch-partner-vehicle", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_vehicle;
