/** =========== CREATE INVOICE =========== */
/**
 * @param {Object} customer
 * @param {Number} days_until_due
 * @param {Number} amount
 * @param {Number} taxes
 * @param {String} description
 * @param {String} bookingId
 * @returns {Object} Invoice
 * @throws {Error} Error Creating Invoice
 /** ====================== */

const { format } = require("date-fns");
const { pushExpoNotification } = require("../expo/push-notification");
const { getDocument } = require("../firestore/get-document");
const { setDocument } = require("../firestore/set-document");
const {
  setSubcollectionDocument,
} = require("../firestore/set-subcollection-document");
const { updateDocument } = require("../firestore/update-document");
const { sendSlackNotification } = require("../slack/send-slack-notification");
const { sendMessage } = require("../twilio/send-message");

const createInvoice = (
  customer,
  days_until_due,
  amount,
  taxes,
  description,
  bookingId
) => {
  return new Promise(async (resolve, reject) => {
    // Create Invoice ID:
    const id = `IN_${customer.firstName.split("")[0]}${
      customer.lastName.split("")[0]
    }${format(new Date(), "MMddyyHHmmss")}`;

    const invoice = {
      id: id,
      date_created: new Date(),
      days_until_due: Number(days_until_due),
      due_date: new Date(
        new Date().getTime() + Number(days_until_due) * 24 * 60 * 60 * 1000
      ),
      subtotal: Number(amount) - Number(taxes),
      taxes: Number(taxes),
      amount: Number(amount).toFixed(2),
      description: description,
      status: "pending",
      type: "invoice",
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
    };

    if (bookingId) {
      const booking = await getDocument("Bookings", bookingId);
      const vehicle = await getDocument("Vehicles", booking?.vehicle?.id);
      invoice.booking = {
        id: bookingId,
        start_date: booking.start_date,
        end_date: booking.end_date,
      };
      invoice.vehicle = {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        image: vehicle.images.corner,
      };
    }

    // Set Document
    await setDocument("Payments", invoice.id, invoice);

    // Update Invoices
    await updateDocument("Customers", customer.id, {
      unpaid_invoices: true,
    });

    // Add Invoice to Customer Document
    await setSubcollectionDocument(
      "Customers",
      customer.id,
      "Payments",
      invoice.id,
      invoice
    );

    // Notify Customer
    const message = `Your have a new invoice of $${amount} for "${description}". 
    Please log in to your account to pay the invoice within ${days_until_due} days: https://poshcars.io/dashboard`;
    if (customer.notifications?.sms) await sendMessage(message, customer.phone);
    await pushExpoNotification(
      customer.id,
      "New Invoice",
      `$${amount} - ${description}`
    );

    // Send Slack Notification
    await sendSlackNotification(
      `${customer.firstName} ${customer.lastName} new invoice: $${amount} - ${description}`
    );

    // Return invoice id
    resolve(invoice);
  });
};

module.exports = { createInvoice };
