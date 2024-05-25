const admin = require("firebase-admin");

const documentExists = async (collection, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!collection || !id) {
        reject({
          message: "documentExists: Missing Collection or ID.",
        });
        return;
      }

      // Get Document
      const document = await admin
        .firestore()
        .collection(collection)
        .doc(id)
        .get();

      // Return Document Exists
      resolve(document.exists);

      // Handle Error
    } catch (err) {
      reject({
        message: `Error checking if document exists in "${collection}": ${err.message}`,
      });
    }
  });
};

module.exports = { documentExists };
