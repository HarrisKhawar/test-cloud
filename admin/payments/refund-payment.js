const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { deleteDocument } = require("../../util/firestore/delete-document");
const {
  deleteSubcollectionDocument,
} = require("../../util/firestore/delete-subcollection-document");
const { checkUnpaidInvoices } = require("../util/check-unpaid-invoices");
const {
  updateSubcollectionDocument,
} = require("../../util/firestore/update-subcollection-document");

/* ==========================================================================
* ADMIN: REFUND PAYMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - paymentId: <string>
/* ========================================================================== */
const refund_payment = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { paymentId } = request.body;
    if (!paymentId) throw new Error("Missing Payment ID.");

    // Fetch payment
    const payment = await getDocument("Payments", paymentId);

    if (payment.status !== "succeeded")
      throw new Error("Payment needs to be paid before being refunded.");

    // Update Payment
    await updateDocument("Payments", paymentId, {
      status: "refunded",
      stripeId: "manual",
    });

    // Update customer payment
    await updateSubcollectionDocument(
      "Customers",
      payment.customer.id,
      "Payments",
      paymentId,
      {
        status: "refunded",
        stripeId: "manual",
      }
    );

    // Log Success
    logSuccess("admin_refund_payment", "Successfully refunded.");

    // Send Response
    response.status(200).json(payment);

    // Handle Error
  } catch (err) {
    logError("admin_refund_payment:", err.message);
    response.status(500).send("Error refunding payment.");
  }
};

module.exports = refund_payment;
