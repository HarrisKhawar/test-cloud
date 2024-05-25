const smartcar = require("smartcar");
const { getDocument } = require("../../util/firestore/get-document");
const { logError, logSuccess } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { updateDocument } = require("../../util/firestore/update-document");

/* ==========================================================================
* ADMIN: CONTROL VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - vehicleId: <string>
    - action: <string>
/* ========================================================================== */
const control_vehicle = async (request, response) => {
  try {
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { vehicleId, action } = request.body;
    if (!vehicleId || !action) throw new Error("Missing required fields.");

    // Get Vehicle
    const vehicle = await getDocument("Vehicles", vehicleId);

    // Get Vehicle Smartcar ID
    const smartcarId = vehicle.smartcar?.id;
    if (!smartcarId) throw new Error("Vehicle is not set up with smartcar.");

    // Get Access Tokens
    const refreshToken = vehicle.smartcar.refreshToken;

    const client = new smartcar.AuthClient({
      clientId: process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri: process.env.HOST + "/webhooks/smartcar-exchange",
      mode: process.env.ENVIROMENT === "LOCAL" ? "test" : "live",
    });

    const newAccess = await client.exchangeRefreshToken(refreshToken);
    await updateDocument("Vehicles", vehicleId, {
      "smartcar.accessToken": newAccess.accessToken,
      "smartcar.refreshToken": newAccess.refreshToken,
      "smartcar.expiresAt": newAccess.refreshExpiration,
    });

    // Update Access Token
    const access = newAccess.accessToken;

    // Get Vehicle
    const smartcarVehicle = new smartcar.Vehicle(smartcarId, access);

    // Create Response Object
    let responseObject = {};

    // Switch action
    switch (action) {
      case "lock":
        await smartcarVehicle.lock();
        responseObject = { status: "Locked" };
        break;
      case "unlock":
        await smartcarVehicle.unlock();
        responseObject = { status: "Unlocked" };
        break;
      case "fuel":
        const fuel = await smartcarVehicle.fuel();
        console.log(fuel);
        responseObject = {
          data: Number(fuel.percentRemaining) * 100,
          status: "success",
        };
        break;
      case "odometer":
        const odometer = await smartcarVehicle.odometer();
        console.log(odometer);
        responseObject = {
          data: Math.floor(Number(odometer.distance) * 0.621371),
          status: "success",
        };
        break;
      case "location":
        const location = await smartcarVehicle.location();
        console.log(location);
        responseObject = {
          data: `${location.latitude}, ${location.longitude}`,
          latitude: location.latitude,
          longitude: location.longitude,
          status: "success",
        };
        break;
      default:
        throw new Error("Invalid action.");
    }

    // Log Success
    logSuccess(
      "admin_vehicle_controls",
      "Successfully controlled vehicle: " + vehicleId + " " + action
    );

    // Send Response
    response.status(200).json(responseObject);
  } catch (err) {
    logError("admin_vehicle_controls", err.message);
    response.status(400).send(`Error Sending Control Signal: ${err.message}`);
  }
};

module.exports = control_vehicle;
