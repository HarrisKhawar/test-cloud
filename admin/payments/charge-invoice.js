const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
 * ADMIN: CHARGE INVOICE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminId: <string>
    
* Request Body:
    - invoiceId: <string>
    - paymentMethodId: <string>
/* ========================================================================== */
const charge_invoice = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Get Invoice ID
    const { invoiceId, paymentMethodId } = request.body;

    // Confirm Required Fields
    if (!invoiceId) throw new Error("Missing required Invoice ID.");
    if (!paymentMethodId)
      throw new Error("Missing required Payment Method ID.");

    // Fetch Invoice
    const invoice = await getDocument("Payments", invoiceId);

    // Check if Invoice is already paid
    if (invoice?.status === "succeeded")
      throw new Error("Invoice already paid.");

    // Fetch Customer
    const customer = await getDocument("Customers", invoice?.customer?.id);
    if (!customer) throw new Error("Customer not found.");

    // Check if Payment Method belongs to customer
    let belongs = false;
    if (customer?.default_payment_method?.id === paymentMethodId)
      belongs = true;
    if (customer?.payment_methods) {
      customer.payment_methods.forEach((payment) => {
        if (payment.id === paymentMethodId) belongs = true;
      });
    }
    if (!belongs)
      throw new Error("Payment Method does not belong to Customer.");

    // Charge Customer
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customer.stripeId,
      amount: Math.floor(Number(invoice.amount) * 100),
      payment_method: paymentMethodId,
      description: invoice.description,
      currency: "usd",
      metadata: {
        customerId: customer.id,
        bookingId: invoice.booking?.id,
      },
      confirm: true,
    });

    // Check if payment was successful
    if (paymentIntent.status === "succeeded") {
      // Notify Customer via SMS
      const mes = `Your payment of $${invoice.amount} for "${invoice.description}" has been processed.`;
      await sendMessage(mes, customer.phone);

      // Update Invoice Object
      await updateDocument("Payments", invoiceId, {
        status: "succeeded",
        stripeId: paymentIntent.id,
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
          stripeId: paymentIntent.id,
          date_paid: new Date(),
        }
      );
    } else {
      throw new Error("Payment failed.");
    }

    // Check and Update Unpaid Invoices
    await checkUnpaidInvoices(customer.id);

    // Return updated invoice
    const updatedInvoice = await getDocument("Payments", invoiceId);

    // Log Successful Payment
    logSuccess(
      "admin_charge_invoice",
      `Invoice ${invoiceId} paid successfully.`
    );
    response.status(200).json(updatedInvoice);

    // Handle Error
  } catch (err) {
    logError("charge_invoice", err);
    response.status(500).send(err.message);
  }
};

module.exports = charge_invoice;
