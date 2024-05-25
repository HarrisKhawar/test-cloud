const smartcar = require("smartcar");
const { getCollection } = require("../util/firestore/get-collection");
const { updateDocument } = require("../util/firestore/update-document");
const { logSuccess, logError } = require("../util/logs/logging");

/* ==========================================================================
* WEBHOOKS: EXCHANGE SMARTCAR CODE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userid: <string>
    
* Request Body:
    - code: <string>
/* ========================================================================== */

const exchange_smartcar_code = async (request, response) => {
  try {
    // Confirm Required Fields
    const code = request.query.code;
    if (!code) throw new Error("Missing Code.");
    console.log(code);

    // Initialize Smartcar
    const client = new smartcar.AuthClient({
      clientId: process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri: `${process.env.HOST}/webhooks/smartcar-exchange`,
      mode: process.env.ENVIROMENT === "LOCAL" ? "test" : "live",
    });

    // Get Vehicles
    const vehicles = await getCollection("Vehicles");

    // Exchange Code for Access Token
    const tokens = await client.exchangeCode(code);

    // GET ALL VEHICLES
    const smartVehicles = await smartcar.getVehicles(tokens.accessToken);

    const vehiclesNotInSystem = [];
    const vehiclesConfigured = [];

    // GET VEHICLE INFORMATION
    for (let v of smartVehicles.vehicles) {
      const vehicle = new smartcar.Vehicle(v, tokens.accessToken);
      // get identifying information about a vehicle
      const vin = await vehicle.vin();

      // Find vehicle id
      const vehicleId = vehicles.filter((vehicle) => vehicle.vin === vin.vin)[0]
        ?.id;
      if (!vehicleId) {
        vehiclesNotInSystem.push(vin);
        continue;
      }

      const attributes = await vehicle.attributes();
      // Update Vehicle
      await updateDocument("Vehicles", vehicleId, {
        smartcar: {
          id: v,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.refreshExpiration,
        },
      });
      vehiclesConfigured.push(vehicleId);
    }

    // Log Success
    logSuccess("smartcar_auth", "Successfully configured vehicles.", {
      vehiclesConfigured,
      vehiclesNotInSystem,
    });

    // Send Response
    response.redirect(`${process.env.PARTNER_DASHBOARD_URL}`);
  } catch (err) {
    logError("smartcar_exchange_code", err.message);
    response.status(400).send(`Error Generating Link: ${err.message}`);
  }
};

module.exports = exchange_smartcar_code;
