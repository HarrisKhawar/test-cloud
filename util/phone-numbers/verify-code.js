const { getDocument } = require("../firestore/get-document");
const {updateDocument} = require("../firestore/update-document");
const { formatPhoneNumber } = require("./format-phone-number");

const verifyCode = async (code, phone, customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!code || !phone || !customerId)
        throw new Error("Required Fields Missing.");

      // Format Phone Number
      phone = formatPhoneNumber(phone);

      // Get Record
      const record = await getDocument("PhoneNumbers", phone);

      // Verify Code
      if (record.code === code) {

        // Update Phone Record
        await updateDocument("PhoneNumbers", phone, {
          verified: true,
          customerId: customerId,
        });

        // Update Customer Record
        await updateDocument("Customers", customerId, {
            phone: phone,
        });

        // Return
        resolve(true);

      } else {
        // Code does not match
        throw new Error("Invalid Code.");
      }

      // Handle Error
    } catch (err) {
      reject({
        message: `Error Verifying Code: ${err.message}`,
      });
    }
  });
};


module.exports = { verifyCode };