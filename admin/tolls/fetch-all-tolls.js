const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH ALL TOLLS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_tolls = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Fetch All Tolls
    const tolls = await getCollection("Tolls");

    // Remove Toll with ID: latest
    tolls.forEach((toll) => {
      if (toll.id === "latest") {
        tolls.splice(tolls.indexOf(toll), 1);
        console.log("found");
      }
    });

    // Send Response
    response.status(200).json(tolls);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_tolls:", err.message);
    response.status(500).send("Error fetching tolls.");
  }
};

module.exports = fetch_all_tolls;
