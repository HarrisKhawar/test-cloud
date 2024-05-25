const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { deleteDocument } = require("../../util/firestore/delete-document");
const {
  deleteSubcollectionDocument,
} = require("../../util/firestore/delete-subcollection-document");
const { checkUnpaidInvoices } = require("../util/check-unpaid-invoices");

/* ==========================================================================
* ADMIN: DELETE INVOICE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - paymentId: <string>
/* ========================================================================== */
const delete_invoice = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { paymentId } = request.body;
    if (!paymentId) throw new Error("Missing Payment ID.");

    // Fetch payment
    const payment = await getDocument("Payments", paymentId);

    // Delete payment
    await deleteDocument("Payments", paymentId);

    // Delete customer payment
    await deleteSubcollectionDocument(
      "Customers",
      payment.customer.id,
      "Payments",
      paymentId
    );

    // Check Unpaid Invoices
    await checkUnpaidInvoices(payment.customer.id);

    // Log Success
    logSuccess("admin_delete_invoice", "Successfully deleted invoice.");

    // Send Response
    response.status(200).json(payment);

    // Handle Error
  } catch (err) {
    logError("admin_delete_invoice:", err.message);
    response.status(500).send("Error fetching payment.");
  }
};

module.exports = delete_invoice;
