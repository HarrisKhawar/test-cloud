const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { getDocument } = require("../../util/firestore/get-document");
const { generateReceipt } = require("../../util/payments/generate-receipt");
/* ==========================================================================
 * CUSTOMER: DOWNLOAD INVOICE PDF
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - id: <string>
/* ========================================================================== */
const download_pdf = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Get Customer ID and Payment ID
    const { userid: customerId } = request.headers;
    const id = request.body.id;

    // Fetch Invoice
    const invoice = await getDocument("Payments", id);
    const customer = await getDocument("Customers", customerId);

    const url = await generateReceipt(invoice, customer);

    // Send Response
    response.status(200).json(url);

    // Handle Error
  } catch (err) {
    logError("fetch_payment", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = download_pdf;
