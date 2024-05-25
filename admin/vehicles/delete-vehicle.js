const { deleteDocument } = require("../../util/firestore/delete-document");
const { logSuccess, logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
/* ==========================================================================
* ADMIN: DELETE VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - id: <string>
/* ========================================================================== */
const delete_vehicle = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { id } = request.body;
    if (!id) throw new Error("Missing Vehicle ID.");

    // Delete Vehicle
    await deleteDocument("Vehicles", id);

    // Log Success
    logSuccess(
      "admin_delete_vehicle",
      "Successfully deleted vehicle: " + id + ""
    );

    // Send Response
    response.status(200).send(id);
  } catch (err) {
    logError("admin_delete_vehicle:", err.message);
    response.status(500).send("Error deleting vehicle");
  }
};

module.exports = delete_vehicle;
