const { setDocument } = require("../firestore/set-document");
const { sendMessage } = require("../twilio/send-message");
const { formatPhoneNumber } = require("./format-phone-number");

const sendVerificationCode = async (phone) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!phone) throw new Error("Phone Number is required.");

      // Format Phone Number
      phone = formatPhoneNumber(phone);

      // Create Random Code
      const randomCode = (Math.floor(Math.random() * 9000) + 1000).toString();

      // Create Message
      const message = `Your verification code for POSH is ${randomCode}`;

      // Send Message
      await sendMessage(message, phone);

      // Update Records
      await setDocument("PhoneNumbers", phone, {
        code: randomCode,
        verified: false,
      });

      // Return randomCode
      resolve(randomCode);

      // Handle Error
    } catch (err) {
      reject({
        message: `Error Sending Verification Code: ${err.message}`,
      });
    }
  });
};

module.exports = { sendVerificationCode };
