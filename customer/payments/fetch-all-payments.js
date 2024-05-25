const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { getSubcollection } = require("../../util/firestore/get-subcollection");
/* ==========================================================================
 * CUSTOMER: FETCH ALL PAYMENTS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
/* ========================================================================== */
const fetch_all_payments = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Get Customer ID
    const { userid: customerId } = request.headers;

    // Fetch Payments
    const payments = await getSubcollection(
      "Customers",
      customerId,
      "Payments"
    );

    // Send Response
    response.status(200).json(payments);

    // Handle Error
  } catch (err) {
    logError("fetch_payments:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_all_payments;
