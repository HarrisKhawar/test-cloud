const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getSubcollection } = require("../../util/firestore/get-subcollection");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
* ADMIN: FETCH PARTNERS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - partnerId: <string>
    
/* ========================================================================== */
const fetch_partner = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    const { partnerId } = request.body;

    // Fetch Partner
    const partner = await getDocument("Partners", partnerId);
    const vehicles = await getSubcollection("Partners", partnerId, "Vehicles");
    const payments = await getSubcollection("Partners", partnerId, "Payments");
    partner.vehicles = vehicles;
    partner.payments = payments;

    // Log Success
    logSuccess(
      "admin_fetch_partner",
      "Successfully fetched partner."
    );

    // Send Response
    response.status(200).json(partner);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_partner:", err.message);
    response.status(500).send("Error fetching partner.");
  }
};

module.exports = fetch_partner;
