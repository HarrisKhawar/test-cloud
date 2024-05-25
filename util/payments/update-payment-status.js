const { getDocument } = require("../firestore/get-document");
const { updateDocument } = require("../firestore/update-document");
const {
  updateSubcollectionDocument,
} = require("../firestore/update-subcollection-document");

const update_payment_status = async (paymentId, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get Payment
      const payment = await getDocument("Payments", paymentId);

      // Update Status
      if (payment) {
        // Update Payment Status
        await updateDocument("Payments", paymentId, {
          status: status,
        });

        // Update Customer Payment Status
        await updateSubcollectionDocument(
          "Customers",
          payment.customer.id,
          "Payments",
          paymentId,
          {
            status: status,
          }
        );
      }

      // Send Response
      resolve(payment);
    } catch (err) {
      reject({
        message: `Error Updating Payment Status: ${err.message}`,
      });
    }
  });
};

module.exports = { update_payment_status };
