const { getVehicle } = require("../../models/get-vehicle");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");
const { logSuccess, logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
/* ==========================================================================
* ADMIN: EDIT VEHICLE
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
const edit_vehicle = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    const vehicleId = request.body.id;
    if (!vehicleId) throw new Error("No Vehicle ID provided");

    // Create Vehicle Object
    const vehicle = await getDocument("Vehicles", vehicleId);
    const updatedVehicle = getVehicle(request.body);
    updatedVehicle.bookings = vehicle.bookings;

    // Update Vehicle
    await updateDocument("Vehicles", vehicle.id, updatedVehicle);

    // Log Success
    logSuccess("admin_edit_vehicle", "Successfully edited vehicle.");

    // Send Response
    response.status(200).send(vehicle.id);

    // Handle Error
  } catch (err) {
    logError("admin_edit_vehicle:", err.message);
    response.status(500).send("Error Updating Vehicle.");
    return;
  }
  // #endregion
};

module.exports = edit_vehicle;
