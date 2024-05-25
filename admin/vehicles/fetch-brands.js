const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH BRANDS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Headers:
    
/* ========================================================================== */
const fetch_brands = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Get Brands
    const brands = await getCollection("Brands");

    logSuccess(
      "admin-fetch-brands",
      "Successfully fetched brands."
    );

    // Send Response
    response.status(200).json(brands);

    // Handle Error
  } catch (err) {
    logError("admin-fetch-brands:", err.message);
    response.status(500).send("Error fetching brands.");
  }
};

module.exports = fetch_brands;
