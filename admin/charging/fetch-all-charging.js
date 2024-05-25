const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH ALL CHARGING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_charging = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Fetch All Chargings
    const charging = await getCollection("Charging");

    // Remove Charging with ID: latest
    charging.forEach((charge) => {
      if (charge.id === "latest") {
        charging.splice(charging.indexOf(charge), 1);
      }
    });

    // Send Response
    response.status(200).json(charging);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_all_charging:", err.message);
    response.status(500).send("Error fetching Charging.");
  }
};

module.exports = fetch_all_charging;
