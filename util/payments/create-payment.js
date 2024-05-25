const { getDocument } = require("../firestore/get-document");
const { setDocument } = require("../firestore/set-document");
const {
  setSubcollectionDocument,
} = require("../firestore/set-subcollection-document");
const { logError } = require("../logs/logging");
const { sendSlackNotification } = require("../slack/send-slack-notification");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/** =========== CREATE PAYMENT =========== */
/**
 * @param {Object} customer
 * @param {Number} amount
 * @param {Number} taxes
 * @param {String} description
 * @param {String} bookingId
 * @param {String} paymentMethodId
 * @returns {Object} PAYMENT
 * @throws {Error} Error Creating Payment
 /** ====================== */

const createPayment = ({
  customer,
  amount,
  taxes,
  description,
  bookingId,
  paymentMethodId,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Start Payment
      const payment = await stripe.paymentIntents.create({
        customer: customer.stripeId,
        amount: Math.floor(Number(amount) * 100),
        payment_method: paymentMethodId,
        description: description,
        currency: "usd",
        metadata: {
          customerId: customer.id,
          bookingId: bookingId || false,
        },
        confirm: true,
      });

      // Check if Payment was successful
      if (payment.status !== "succeeded") throw new Error("Payment Failed");

      // Payment Object
      const paymentObj = {
        id: payment.id,
        date_created: new Date(),
        subtotal: Number(amount) - Number(taxes),
        amount: amount,
        taxes: taxes,
        description: description,
        status: "succeeded",
        type: "payment",
        customer: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        },
      };

      // Add Booking Information
      if (bookingId) {
        const booking = await getDocument("Bookings", bookingId);
        const vehicle = await getDocument("Vehicles", booking?.vehicle?.id);

        paymentObj.booking = {
          id: booking.id,
          start_date: booking.start_date,
          end_date: booking.end_date,
        };
        paymentObj.vehicle = {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          image: vehicle.images?.corner || false,
        };
      }

      // Set Document
      await setDocument("Payments", paymentObj.id, paymentObj);

      // Add Payment to Customer Document
      await setSubcollectionDocument(
        "Customers",
        customer.id,
        "Payments",
        paymentObj.id,
        paymentObj
      );

      // Send Slack Notification
      await sendSlackNotification(
        `${customer.firstName} ${customer.lastName} payment received: $${amount} - ${description}`
      );

      // Return Payment
      resolve(paymentObj);
    } catch (error) {
      logError("Error Creating Payment", error);
      reject({ message: error.message });
    }
  });
};

module.exports = { createPayment };
