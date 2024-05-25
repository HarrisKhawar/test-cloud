const smartcar = require("smartcar");
const { handleRequest } = require("../admin/request-handling/handle-request");
const { logError, logSuccess } = require("../util/logs/logging");
const { updateDocument } = require("../util/firestore/update-document");
const { getCollection } = require("../util/firestore/get-collection");
const { getDocument } = require("../util/firestore/get-document");

/* ==========================================================================
* ADMIN: GET SMARTCAR SCOPES
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userid: <string>
    
* Request Body:
    - vehicleId: <string>
/* ========================================================================== */

const get_smartcar_scopes = async (request, response) => {
  try {
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { vehicleId } = request.body;
    if (!vehicleId) throw new Error("Missing VehicleId.");

    // Initialize Smartcar
    const client = new smartcar.AuthClient({
      clientId: process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri: process.env.HOST + "/webhooks/smartcar",
      mode: process.env.ENVIROMENT === "LOCAL" ? "live" : "test",
    });

    // Get Vehicles
    const vehicle = await getDocument("Vehicles", vehicleId);

    // Check Smart car for scopes
    const allScopes = [
      "control_security",
      "read_fuel",
      "read_location",
      "read_odometer",
      "read_vehicle_info",
      "read_vin",
    ];

    // Get supported scopes
    const compatibility = await smartcar.getCompatibility(vehicle.vin, allScopes);

    // Filter supported scopes
    let supportedScopes = [];
    const capabilities = compatibility.capabilities;
    for (let capability of capabilities) {
      if (capability.capable) supportedScopes.push(capability.permission);
    }
 
    // Add supported scopes to vehicle
    await updateDocument("Vehicles", vehicleId, {
      "smartcar.scopes": supportedScopes,
    });

    console.log(supportedScopes);

    response.status(200).send(supportedScopes);
  } catch (err) {
    logError("smartcar_get_link", err.message);
    response.status(400).send(`Error Generating Link: ${err.message}`);
  }
};

module.exports = get_smartcar_scopes;
