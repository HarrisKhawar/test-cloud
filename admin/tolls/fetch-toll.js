const { handleRequest } = require("../request-handling/handle-request");
const { getDocument } = require("../../util/firestore/get-document");
const { logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH TOLLS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    tollId: <string>
/* ========================================================================== */
const fetch_toll = 
  async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Confirm Required Fields
      const { tollId } = request.body;
      if (!tollId) throw new Error("Missing required field: id");

      // Fetch Toll
      const toll = await getDocument("Tolls", tollId);

      // Send Response
      response.status(200).json(toll);

      // Handle Error
    } catch (err) {
      logError("admin_fetch_toll:", err.message);
      response.status(500).send("Error fetching toll by id.");
    }
  }


  module.exports = fetch_toll;
