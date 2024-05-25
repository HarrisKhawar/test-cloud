const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
* ADMIN: FETCH invoiceS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - invoiceId: <string>
    
/* ========================================================================== */
const fetch_invoice = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    const { invoiceId } = request.body;

    // Fetch invoice
    const invoice = await getDocument("Invoices", invoiceId);

    // Log Success
    logSuccess(
      "admin_fetch_invoice",
      "Successfully fetched invoice."
    );

    // Send Response
    response.status(200).json(invoice);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_invoice:", err.message);
    response.status(500).send("Error fetching invoice.");
  }
};

module.exports = fetch_invoice;
