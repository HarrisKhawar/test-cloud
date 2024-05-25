const admin = require("firebase-admin");
const { logSuccess } = require("../logs/logging");

const updateDocument = (collection, docId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!collection || !docId || !data) {
        reject({
          message: "updateDocument: Missing Collection, Doc ID or Data.",
        });
        return;
      }

      // Update Document
      await admin.firestore().collection(collection).doc(docId).update(data);

      // Log Success
      logSuccess("updateDocument", [`Updated ${docId} in ${collection}:`], data);

      // Return Document ID
      resolve(docId);

    } catch (err) {
      // Handle Error
      reject({
        message: `Error Updating Data to ${collection}: ${err.message}`,
      });
    }
  });
};

module.exports = { updateDocument };
