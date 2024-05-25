const admin = require("firebase-admin");

const getDocument = (collection, docId) => {
  return new Promise(async (resolve, reject) => {
    try {

      // Confirm Required Fields
      if (!collection || !docId) {
        reject({
          message: "getDocument: Missing Collection or Doc ID.",
        });
        return;
      }

      // Get Document
      const document = await admin
        .firestore()
        .collection(collection)
        .doc(docId)
        .get();

      // Check if Document Exists
      if (!document.exists) {
        reject({
          message: `"${docId}" not found in "${collection}"`,
        });
        return;
      }

      // Return Document Data
      resolve(document.data());

    } catch (err) {
      // Handle Error
      reject({
        message: `Error getting document from "${collection}": ${err.message}`,
      });
    }
  });
};

module.exports = { getDocument };
