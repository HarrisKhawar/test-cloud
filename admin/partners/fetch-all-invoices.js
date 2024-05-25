const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH ALL INVOICES
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_invoices = 
  async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Fetch All Payments
      const invoices = await getCollection("Invoices");

      // Send Response
      response.status(200).json(invoices);

      // Handle Error
    } catch (err) {
      logError("admin_fetch_all_invoices:", err.message);
      response.status(500).send("Error fetching all invoices.");
    }
  }

  module.exports = fetch_all_invoices;
