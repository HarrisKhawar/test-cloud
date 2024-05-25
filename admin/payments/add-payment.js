
const {
  createPaymentIntent,
} = require("../../util/stripe/create-payment-intent");
const { handleRequest } = require("../request-handling/handle-request");
const { logError, logSuccess } = require("../../util/logs/logging");
const { getCustomer } = require("../../models/get-customer");
const { getDocument } = require("../../util/firestore/get-document");
const { sendMessage } = require("../../util/twilio/send-message");
const { createInvoice } = require("../../util/payments/create-invoice");

/* ==========================================================================
* ADMIN: ADD PAYMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - customerId: <string>
    - amount: <string>
    - description: <string>
    - type: <string> ("payment" or "invoice")
    - days_until_due: <string>
    - payment_method: <string>
    - bookingId: <string> (optional)
    - fileURL: <string> (optional)
/* ========================================================================== */

const add_payment = async (request, response) => {
  try {
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const body = request.body;
    const customerId = body.customerId;
    const amount = body.amount;
    const description = body.description;
    const type = body.type;
    const payment_method_id = body.payment_method_id;
    const days_until_due = body.days_until_due;
    const bookingId = body.bookingId;
    const fileURL = body.fileURL;

    // Validate Request Body
    if (!customerId)
      throw new Error("Invalid Request: Customer ID not provided.");
    if (!amount) throw new Error("Invalid Request: Amount not provided.");
    if (!description)
      throw new Error("Invalid Request: Description not provided.");
    if (!type) throw new Error("Invalid Request: Type not provided.");
    if (type === "payment" && !payment_method_id)
      throw new Error("Invalid Request: Payment Method ID not provided.");
    if (type === "invoice" && !days_until_due)
      throw new Error("Invalid Request: Due Date not provided.");

    // Get Customer
    const customer = getCustomer(await getDocument("Customers", customerId));

    // Create Metadata
    let metadata = {};
    if (fileURL) metadata.fileURL = fileURL;
    if (bookingId) metadata.bookingId = bookingId;

    // Charge Customer
    let payment = null;
    if (type === "payment") {
      // Charge Customer Card
      payment = await createPaymentIntent(
        customer,
        amount,
        description,
        payment_method_id,
        metadata
      );
      
      // Notify Customer via SMS
      const message = `Your payment of $${amount} for "${description}" has been processed.`;
      await sendMessage(message, customer.phone);
    } else if (type === "invoice") {
      // Send Invoice
      payment = await createInvoice(
        customer,
        days_until_due,
        amount,
        0,
        description,
        bookingId
      );
    } else {
      throw new Error("Invalid Payment Type: " + type);
    }

    // Log Successful Payment
    logSuccess("admin_add_payment", "Payment/Invoice Added:", payment.id);
    response.status(200).send(payment.id);

    // Handle Errors
  } catch (err) {
    logError("adminAddPayment", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_payment;
