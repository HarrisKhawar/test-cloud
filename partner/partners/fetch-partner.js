const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { handleRequest } = require("../request-handling/handle-request");
const { getSubcollection } = require("../../util/firestore/get-subcollection");
/* ==========================================================================
 * PARTNER: FETCH PARTNER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
/* ========================================================================== */
const fetch_partner = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;

    // Fetch Customer
    const partner = await getDocument("Partners", partnerId);
    const vehicles = await getSubcollection("Partners", partnerId, "Vehicles");
    const payments = await getSubcollection("Partners", partnerId, "Payments");
    partner.vehicles = vehicles;
    partner.payments = payments;

    // Log Success
    logSuccess("fetch_partner", "Successfully fetched partner.");

    // Send Response
    response.status(200).json(partner);

    // Handle Error
  } catch (err) {
    logError("fetch_partner", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_partner;
