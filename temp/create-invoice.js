const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { setDocument } = require("../util/firestore/set-document");
const {
  setSubcollectionDocument,
} = require("../util/firestore/set-subcollection-document");
const { logSuccess } = require("../util/logs/logging");

/** =========== CREATE INVOICE =========== */
/**
 * @param {Object} customer
 * @param {Number} amount
 * @param {String} description
 * @param {String} payment_method
 * @param {Object} metadata
 * @returns {Object} Invoice
 * @throws {Error} Error Creating Invoice
 /** ====================== */

const createInvoice = async (
  customer,
  amount,
  description,
  days_until_due,
  metadata
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!customer || !amount || !description || !days_until_due)
        reject({
          message: "Invalid Request: Missing Required Fields for Invoice",
        });

      // Create Invoice Item
      await stripe.invoiceItems.create({
        customer: customer.stripeId,
        amount: Number(amount) * 100,
        currency: "usd",
        description: description,
      });

      // Create Invoice
      const invoice = await stripe.invoices.create({
        customer: customer.stripeId,
        days_until_due: Number(days_until_due),
        auto_advance: true,
        metadata: {
          customerId: customer.id,
          ...metadata,
        },
        collection_method: "send_invoice",
        automatic_tax: {
          enabled: false,
        },
      });

      // Send Invoice
      await stripe.invoices.sendInvoice(invoice.id);

      // Check if invoice was successful
      if (invoice.status) {
        // Log Success
        logSuccess("Invoice Created", invoice.id);

        // Create Payment Object
        const payload = {
          id: invoice.id,
          date_created: new Date(Number(invoice.created) * 1000),
          amount: amount,
          description: description,
          metadata: metadata,
          days_until_due: days_until_due,
          status: invoice.status,
          type: "invoice",
          payment_intent: invoice.payment_intent,
        };

        // Add Invoice to Customer Payments Subcollection
        await setSubcollectionDocument(
          "Customers",
          customer.id,
          "Payments",
          invoice.id,
          payload
        );

        // Add Customer Details to Payment Object
        payload.customer = {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          stripeId: customer.stripeId,
        };

        // Add Invoice to Payments Collection
        await setDocument("Payments", invoice.id, payload);

        // Return invoice
        resolve(payload);
      } else {
        // Invoice Failed
        reject({ message: "Invoice Failed." });
      }

      // Catch Errors
    } catch (err) {
      reject({ message: "Error Creating Invoice: " + err.message });
    }
  });
};

module.exports = { createInvoice };
