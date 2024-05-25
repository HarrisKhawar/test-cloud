const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { deleteSubcollectionDocument } = require("../../util/firestore/delete-subcollection-document");
const { deleteDocument } = require("../../util/firestore/delete-document");

/* ==========================================================================
* ADMIN: DELETE PARTNER PAYMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - id: <string>
    
/* ========================================================================== */
const delete_partner_payment = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    const { id } =
      request.body;

    // Confirm Required Fields
    if (!id)
      throw new Error("Missing ID.");

    // Get Payment
    const payment = await getDocument("Invoices", id);
    const partnerId = payment.partner.id;

    await deleteSubcollectionDocument("Partners", partnerId, "Payments", id);
    await deleteDocument("Invoices", id);

    // Log Success
    logSuccess("admin-delete-partner-payment", "Successfully deleted payment for partner.");

    // Send Response
    response.status(200).json(payment);

    // Handle Error
  } catch (err) {
    logError("admin-delete-partner-payment:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = delete_partner_payment;
