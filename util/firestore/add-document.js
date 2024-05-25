const admin = require("firebase-admin");
const { logSuccess } = require("../logs/logging");

const addDocument = (collection, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!collection || !data) {
        reject({
          message: "addDocument: Missing Collection or Data.",
        });
        return;
      }

      // Add Document
      const doc = await admin.firestore().collection(collection).add(data);

      // Update Document ID
      await admin.firestore().collection(collection).doc(doc.id).update({
        id: doc.id,
      });

      // Log Success
      logSuccess("addDocument:", [`Added "${doc.id}" to "${collection}"`]);

      // Return Document ID
      resolve(doc.id);

    } catch (err) {
      // Handle Error
      reject({
        message: `Error Adding Data to "${collection}": ${err.message}`,
      });
    }
  });
};

module.exports = { addDocument };
