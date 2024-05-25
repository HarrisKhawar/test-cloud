const admin = require("firebase-admin");
const { logSuccess } = require("../logs/logging");

const setDocument = (collection, docId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!collection || !docId || !data) {
        reject({
          message: "setDocument: Missing Collection, Doc ID or Data.",
        });
        return;
      }

      // Add ID to Document
      data.id = docId;

      // Set Document
      await admin.firestore().collection(collection).doc(docId).set(data);

      // Log Success
      logSuccess("setDocument", [`Set "${docId}" to "${collection}"`]);

      // Return Document ID
      resolve(docId);

    } catch (err) {
      // Handle Error
      reject({
        message: `Error Setting Data to "${collection}": ${err.message}`,
      });
    }
  });
};

module.exports = { setDocument };
