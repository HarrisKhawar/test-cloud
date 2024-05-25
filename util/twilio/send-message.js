const { logSuccess } = require("../logs/logging");
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendMessage = async (message, to) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!message || !to) resolve();
      // Send Message
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_NUMBER,
        to: to,
      });

      // Log Success
      logSuccess("Send Twilio SMS:", `Sent Message to ${to}: ${message}`);

      // Return Message
      resolve(true);
      // Handle Error
    } catch (err) {
      reject({
        message: `${err.message}`,
      });
    }
  });
};

module.exports = { sendMessage };
