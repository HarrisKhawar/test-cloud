const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
* ADMIN: FETCH PAYMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - paymentId: <string>
/* ========================================================================== */
const fetch_payment = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { paymentId } = request.body;
    if (!paymentId) throw new Error("Missing Payment ID.");

    // Fetch payment
    const payment = await getDocument("Payments", paymentId);

    // Log Success
    logSuccess(
      "admin_fetch_payment",
      "Successfully fetched payment:",
      paymentId
    );

    // Send Response
    response.status(200).json(payment);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_payment:", err.message);
    response.status(500).send("Error fetching payment.");
  }
};

module.exports = fetch_payment;
