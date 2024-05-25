const { logError, logSuccess } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");
const {
  updateSubcollectionDocument,
} = require("../../util/firestore/update-subcollection-document");
const { sendMessage } = require("../../util/twilio/send-message");
const { checkUnpaidInvoices } = require("../util/check-unpaid-invoices");
/* ==========================================================================
 * ADMIN: PAY INVOICE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminId: <string>
    
* Request Body:
    - invoiceId: <string>
    - source: <string>
/* ========================================================================== */
const pay_invoice = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Get Invoice ID
    const { invoiceId, source } = request.body;

    // Confirm Required Fields
    if (!invoiceId) throw new Error("Missing required Invoice ID.");
    if (!source) throw new Error("Missing required source.");

    // Fetch Invoice
    const invoice = await getDocument("Payments", invoiceId);

    // Check if Invoice is already paid
    if (invoice?.status === "succeeded")
      throw new Error("Invoice already paid.");

    // Fetch Customer
    const customer = await getDocument("Customers", invoice?.customer?.id);

    if (!customer) throw new Error("Customer not found.");

    // Update Invoice Object
    await updateDocument("Payments", invoiceId, {
      status: "succeeded",
      stripeId: source,
      date_paid: new Date(),
    });

    // Update Customer Object
    await updateSubcollectionDocument(
      "Customers",
      customer.id,
      "Payments",
      invoiceId,
      {
        status: "succeeded",
        stripeId: source,
        date_paid: new Date(),
      }
    );

    // Check Unpaid Invoices
    await checkUnpaidInvoices(customer.id);

    // Return updated invoice
    const updatedInvoice = await getDocument("Payments", invoiceId);

    // Send Message
    const message = `Your invoice of $${invoice.amount} for ${invoice.description} is paid.`;
    await sendMessage(message, customer.phone);

    // Log Successful Payment
    logSuccess("admin_pay_invoice", `Invoice ${invoiceId} paid successfully.`);
    response.status(200).json(updatedInvoice);

    // Handle Error
  } catch (err) {
    logError("pay_invoice", err);
    console.log(err);
    response.status(500).send(err.message);
  }
};

module.exports = pay_invoice;
