const {
  createPaymentIntent,
} = require("../../util/stripe/create-payment-intent");
const { handleRequest } = require("../request-handling/handle-request");
const { logError, logSuccess } = require("../../util/logs/logging");
const { getCustomer } = require("../../models/get-customer");
const { getDocument } = require("../../util/firestore/get-document");
const { sendMessage } = require("../../util/twilio/send-message");
const { createInvoice } = require("../../util/payments/create-invoice");
const { updateDocument } = require("../../util/firestore/update-document");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* ==========================================================================
  * ADMIN: CREATE STRIPE INVOICE
  /* ==========================================================================
  
  * Request Headers: 
    Authorization: <access token>
    idToken: <firebase auth token>
    adminid: <string>
  
  * Request Body:
      - invoiceId: <string>
  /* ========================================================================== */

const create_stripe_invoice = async (request, response) => {
  try {
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { invoiceId } = request.body;

    // Validate Request Body
    if (!invoiceId)
      throw new Error("Invalid Request: Invoice ID not provided.");

    // Get Invoice
    const invoice = await getDocument("Payments", invoiceId);

    // Get Customer
    const customer = await getDocument("Customers", invoice.customer.id);

    const stripeInvoice = await stripe.invoices.create({
      customer: customer.stripeId,
      collection_method: "send_invoice",
      description: invoice.description,
      metadata: {
        invoiceId: invoice.id,
      },
      days_until_due: invoice.days_until_due,
      amount_due: invoice.amount,
      lines: {
        data: [
          {
            description: invoice.description,
            amount: invoice.amount,
            currency: "usd",
            quantity: 1,
            amount_exclude_tax: invoice.amount,
          },
        ],
      },
    });

    // Send Invoice and Get Link
    const sendInvoice = await stripe.invoices.sendInvoice(stripeInvoice.id);
    const link = sendInvoice.hosted_invoice_url;

    // Update Invoice
    await updateDocument("Payments", invoiceId, {
      stripe: {
        id: stripeInvoice.id,
        link: link,
      },
    });

    // Log Successful Payment
    logSuccess(
      "admin-create-stripe-invoice",
      "Stripe Invoice created:",
      stripeInvoice.id
    );
    response.status(200).json({ link: link });

    // Handle Errors
  } catch (err) {
    logError("admin-create-stripe-invoice", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = create_stripe_invoice;
