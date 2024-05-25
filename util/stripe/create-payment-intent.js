const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  setSubcollectionDocument,
} = require("../firestore/set-subcollection-document");
const { setDocument } = require("../firestore/set-document");
const { logSuccess } = require("../logs/logging");

/** =========== CREATE PAYMENT INTENT =========== */
/**
 * @param {Object} customer
 * @param {Number} amount
 * @param {String} description
 * @param {String} payment_method
 * @param {Object} metadata
 * @returns {Object} Payment Intent
 **/

const createPaymentIntent = async (
  customer,
  amount,
  description,
  payment_method,
  metadata,
  bookingId,
  discount,
  tax
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!customer || !amount || !description || !payment_method) {
        reject({
          message: "Invalid Request: Missing Required Fields for Payment",
        });
        return;
      }

      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        customer: customer.stripeId,
        amount: Math.floor(Number(amount) * 100),
        payment_method: payment_method,
        description: description,
        currency: "usd",
        metadata: {
          customerId: customer.id,
          ...metadata,
        },
        confirm: true,
      });

      // Check if Payment Intent was successful
      if (paymentIntent.status === "succeeded") {
        // Log Success
        logSuccess("Payment Intent Created", paymentIntent.id);

        // Create payload for to add to customer document
        const payload = {
          id: paymentIntent.id,
          date_created: new Date(Number(paymentIntent.created) * 1000),
          amount: amount,
          description: description,
          metadata: metadata,
          payment_method: paymentIntent.payment_method,
          status: paymentIntent.status,
          type: "payment",
          bookingId: bookingId || false,
          discount: discount || false,
          taxes: tax || false,
        };

        // Add Payment Intent to User Payments Collection
        setSubcollectionDocument(
          "Customers",
          customer.id,
          "Payments",
          paymentIntent.id,
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

        // Add Payment Intent to Payments Collection
        await setDocument("Payments", paymentIntent.id, payload);

        // Return PaymentIntent
        resolve(payload);
      } else {
        // Payment Intent Failed
        reject({ message: "Payment Failed" });
      }

      // Catch Other Errors
    } catch (err) {
      reject({ message: "Error Proccessing Payment: " + err.message });
    }
  });
};

module.exports = { createPaymentIntent };
