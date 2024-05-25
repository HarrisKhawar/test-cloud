const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH ALL PAYMENTS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_payments = 
  async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Fetch All Payments
      const payments = await getCollection("Payments");

      // Log Success
      logSuccess(
        "admin_fetch_all_payments",
        "Successfully fetched all payments."
      );

      // Send Response
      response.status(200).json(payments);

      // Handle Error
    } catch (err) {
      logError("admin_fetch_all_payments:", err.message);
      response.status(500).send("Error fetching all payments.");
    }
  }

  module.exports = fetch_all_payments;
