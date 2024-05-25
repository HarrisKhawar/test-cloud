const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { handleRequest } = require("../request-handling/handle-request");
/* ==========================================================================
 * CUSTOMER: FETCH CUSTOMER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
/* ========================================================================== */
const fetch_customer = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;

    // Fetch Customer
    const customer = await getDocument("Customers", customerId);

    // Log Success
    logSuccess("fetch_customer", "Successfully fetched Customer.");

    // Send Response
    response.status(200).json(customer);

    // Handle Error
  } catch (err) {
    logError("fetch_customer", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_customer;
