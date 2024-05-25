const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH ALL CUSTOMERS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_customers = 
  async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Fetch All Customers
      const customers = await getCollection("Customers");

      // Send Response
      response.status(200).json(customers);

      // Handle Error
    } catch (err) {
      logError("admin_fetch_all_customers:", err.message);
      response.status(500).send("Error fetching customers.");
    }
  }


  module.exports = fetch_all_customers;
