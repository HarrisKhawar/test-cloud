const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
* ADMIN: FETCH CUSTOMER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - customerId: <string>
/* ========================================================================== */
const fetch_customer = async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Confirm Required Fields
      const { customerId } = request.body;
      if (!customerId) throw new Error("Missing Customer ID.");

      // Fetch Customer
      const customer = await getDocument("Customers", customerId);

      // Log Success
      logSuccess("admin_fetch_customer", "Successfully fetched customer:", customerId);

      // Send Response
      response.status(200).json(customer);

      // Handle Error
    } catch (err) {
      logError("admin_fetch_customer:", err.message);
      response.status(500).send("Error fetching customer.");
    }
  }


  module.exports = fetch_customer;
