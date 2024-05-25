const { pushExpoNotification } = require("../expo/push-notification");
const { logSuccess } = require("../logs/logging");
const { sendMessage } = require("../twilio/send-message");

const sendNotifications = ({ title, message, customer }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm required fields
      if (!title || !message || !customer) {
        reject({
          message: "Missing Required Fields for Send Notifications",
        });
      }

      // Send Notifications to Customer
      if (customer.notifications?.push) {
        await pushExpoNotification(customer.id, title, message);
      }
      if (customer.notifications?.email) {
        // Send Email
      }
      if (customer.notifications?.sms) {
        await sendMessage(message, customer.phone);
      }

      // Resolve
      logSuccess(
        "send-notifications",
        `Notification Sent to ${customer.firstName} ${customer.lastName}`
      );
      resolve({
        message: `Notification Sent to ${customer.firstName} ${customer.lastName}`,
      });
    } catch (err) {
      reject({
        message: `${err.message}`,
      });
    }
  });
};

module.exports = { sendNotifications };
