const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH ALL PARTNERS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_partners = 
  async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Fetch All Payments
      const partners = await getCollection("Partners");

      // Send Response
      response.status(200).json(partners);

      // Handle Error
    } catch (err) {
      logError("admin_fetch_all_partners:", err.message);
      response.status(500).send("Error fetching all partners.");
    }
  }

  module.exports = fetch_all_partners;
