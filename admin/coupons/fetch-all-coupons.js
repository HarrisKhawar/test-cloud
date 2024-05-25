const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getCollection } = require("../../util/firestore/get-collection");

/* ==========================================================================
* ADMIN: FETCH ALL COUPONS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    
/* ========================================================================== */
const fetch_all_coupons = async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Fetch Customer
      const coupons = await getCollection("Coupons");

      // Log Success
      logSuccess("admin-fetch-all-coupons", "Successfully fetched all coupons.");

      // Send Response
      response.status(200).json(coupons);

      // Handle Error
    } catch (err) {
      logError("admin-fetch-all-coupons:", err.message);
      response.status(500).send("Error fetching coupons.");
    }
  }


  module.exports = fetch_all_coupons;
