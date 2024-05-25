const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");
const {
  updateSubcollectionDocument,
} = require("../../util/firestore/update-subcollection-document");
const { getSubcollection } = require("../../util/firestore/get-subcollection");
const { handleResponse } = require("../request-handling/handle-response");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const { useCoupon } = require("../../util/coupons/use-coupon");
const { applyCoupon } = require("../../util/coupons/apply-coupon");
/* ==========================================================================
 * CUSTOMER: PAY INVOICE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - invoiceId: <string>
    - paymentMethodId: <string>
    - code: <string>
/* ========================================================================== */
const pay_invoice = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Get Customer ID and Invoice ID
    const { userid: customerId } = request.headers;
    const { invoiceId, paymentMethodId, code } = request.body;

    // Confirm Required Fields
    if (!customerId || !invoiceId || !paymentMethodId)
      throw new Error("Missing required fields.");

    // Fetch Invoice
    const invoice = await getDocument("Payments", invoiceId);

    // Check if Invoice belongs to the Customer
    if (customerId !== invoice?.customer?.id)
      throw new Error("Invalid Request: Invoice does not belong to customer.");

    // Check if Invoice is already paid
    if (invoice?.status === "succeeded")
      throw new Error("Invoice already paid.");

    // Get Customer Object
    const customer = await getDocument("Customers", customerId);

    // Get Customer Payment Methods
    const paymentMethods = [];
    paymentMethods.push(customer?.default_payment_method?.id);
    if (customer?.payment_methods) {
      customer?.payment_methods?.forEach((paymentMethod) => {
        paymentMethods.push(paymentMethod.id);
      });
    }

    // Check if Payment Method belongs to Customer
    if (!paymentMethods.includes(paymentMethodId))
      throw new Error(
        "Invalid Request: Payment Method does not belong to customer."
      );

    // Apply Coupon
    let price = {};
    if (code) {
      price = await applyCoupon({
        id: code,
        price: invoice,
        tax: Number(Number(invoice.amount) / Number(invoice.subtotal) - 1),
        customerId,
      });
      invoice.discount = price.discount;
      invoice.subtotal = price.subtotal;
      invoice.taxes = price.tax;
      invoice.amount = price.total;
    }

    // Pay Invoice
    const payment = await stripe.paymentIntents.create({
      customer: customer.stripeId,
      amount: Math.floor(Number(invoice.amount) * 100),
      payment_method: paymentMethodId,
      description: invoice.description,
      currency: "usd",
      confirm: true,
    });

    if (payment.status !== "succeeded")
      throw new Error("Payment Failed. Please contact support.");

    // Update Invoice Object
    const invoiceUpdate = {
      status: "succeeded",
      stripeId: payment.id,
      date_paid: new Date(),
    };
    if (code) {
      invoiceUpdate.discount = price.discount;
      invoiceUpdate.subtotal = price.subtotal;
      invoiceUpdate.taxes = price.tax;
      invoiceUpdate.amount = price.total;
    }
    await updateDocument("Payments", invoiceId, invoiceUpdate);

    // Update Customer Object
    const customerUpdate = {
      status: "succeeded",
      stripeId: payment.id,
      date_paid: new Date(),
    };
    if (code) {
      customerUpdate.discount = price.discount;
      customerUpdate.subtotal = price.subtotal;
      customerUpdate.taxes = price.tax;
      customerUpdate.amount = price.total;
    }
    await updateSubcollectionDocument(
      "Customers",
      customer.id,
      "Payments",
      invoiceId,
      customerUpdate
    );

    // Get Customer Invoices
    const invoices = await getSubcollection(
      "Customers",
      customer.id,
      "Payments"
    );

    // Check if all Invoices are paid
    let unpaid_invoice = false;
    for (const i of invoices) {
      if (i.type === "invoice" && i.status !== "succeeded") {
        unpaid_invoice = true;
        break;
      }
    }
    // Update Customer Object
    await updateDocument("Customers", customer.id, {
      unpaid_invoices: unpaid_invoice,
    });

    // Return updated invoice
    const updatedInvoice = await getDocument("Payments", invoiceId);

    // Update Coupon
    if (code) {
      await useCoupon({
        id: code,
        price: price,
        customerId,
      });
    }

    // Log Successful Payment
    await sendSlackNotification(
      `${customer.firstName} ${customer.lastName} - Invoice Paid $${invoice.amount}`
    );
    response.status(200).json(updatedInvoice);

    // Handle Error
  } catch (err) {
    logError("pay_invoice", err);
    console.log(err);
    response.status(500).send(err.message);
  }
};

module.exports = pay_invoice;
