const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH ALL BOOKINGS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_bookings = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Fetch All Bookings
    const bookings = await getCollection("Bookings");

    // Send Response
    response.status(200).json(bookings);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_all_bookings:", err.message);
    response.status(500).send("Error fetching bookings.");
  }
};

module.exports = fetch_all_bookings;
