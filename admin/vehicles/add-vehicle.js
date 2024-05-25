const { handleRequest } = require("../request-handling/handle-request");
const { getVehicle } = require("../../models/get-vehicle");
const { setDocument } = require("../../util/firestore/set-document");
const { logSuccess, logError } = require("../../util/logs/logging");
/* ==========================================================================
* ADMIN: ADD VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - id: <string>
    - make: <string>
    - model: <string>
    - year: <string>
    - license: <string>
    - vin: <string>
    - trim: <string>
    - drive: <string>
    - fuel: <string>
    - seats: <string>
    - doors: <string>
    - color: <string>
    - plan: {
            name: <string>
            id: <string>
        }
    - rates: {
            daily: <string>
            monthly: <string>
        }
    - status: {
            available: <boolean>
        }
    - images: {
            front: <string>
            back: <string>
            corner: <string>
            side: <string>
        }
/* ========================================================================== */
const add_vehicle = async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Create Vehicle Object
      const vehicle = getVehicle(request.body);
      const vehicleId = await setDocument("Vehicles", vehicle.id, vehicle);

      // Log Success
      logSuccess(
        "admin_add_vehicle",
        "Successfully added vehicle to database: ",
        vehicleId
      );

      // Send Response
      response.status(200).send(vehicleId);

      // Handle Error
    } catch (err) {
      logError("admin_add_vehicle:", err.message);
      response.status(500).send("Error Adding Vehicle to Database.");
    }
  }


  module.exports = add_vehicle;
