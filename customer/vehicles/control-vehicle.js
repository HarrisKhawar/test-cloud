const smartcar = require("smartcar");
const { getDocument } = require("../../util/firestore/get-document");
const { logError, logSuccess } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { updateDocument } = require("../../util/firestore/update-document");
const { reverseGeocoding } = require("../../util/tools/reverse-geocoding");

/* ==========================================================================
* CUSTOMER: CONTROL VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - action: <string>
/* ========================================================================== */
const control_vehicle = async (request, response) => {
  try {
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { action } = request.body;
    if (!action) throw new Error("Missing required fields.");


    // Get Customer
    const customer = await getDocument("Customers", customerId);
    
    // Get Booking
    const bookingId = customer.booking?.id;
    if (!bookingId) throw new Error("You do not have a booking.");
    const booking = await getDocument("Bookings", bookingId);
    if (booking.status !== "active") throw new Error("Booking is not active.");

    // Get Vehicle
    const vehicle = await getDocument("Vehicles", booking.vehicle.id);

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
    await updateDocument("Vehicles", booking.vehicle.id, {
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
        responseObject = {
          data: `${Number(Number(fuel.percentRemaining) * 100)}%`,
          status: "success",
        };
        break;
      case "odometer":
        const odometer = await smartcarVehicle.odometer();
        responseObject = {
          data: Math.floor(Number(odometer.distance) * 0.621371).toString() + " miles",
          status: "success",
        };
        break;
      case "location":
        const location = await smartcarVehicle.location();
        const address = await reverseGeocoding(location.latitude, location.longitude);
        responseObject = {
          data: address,
          latitude: location.latitude,
          longitude: location.longitude,
          status: "success",
        };
        break;
      default:
        throw new Error("Feature not available.");
    }

    // Log Success
    logSuccess(
      "admin_vehicle_controls",
      "Successfully controlled vehicle: " + booking.vehicle.id + " " + action
    );

    // Send Response
    response.status(200).json(responseObject);
  } catch (err) {
    logError("customer_vehicle_controls", err.message);
    response.status(400).send(`Error Sending Control Signal: ${err.message}`);
  }
};

module.exports = control_vehicle;
