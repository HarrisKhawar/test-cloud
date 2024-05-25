const admin = require("firebase-admin");

const getCollection = (collection) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!collection) {
        reject({
          message: "getCollection: Missing Collection.",
        });
        return;
      }

      // Get collection
      const documents = await admin.firestore().collection(collection).get();

      // Create array of documents
      const documentsList = [];
      documents.forEach((d) => {
        documentsList.push(d.data());
      });

      // Return Document Data
      resolve(documentsList);
    } catch (err) {
      // Handle Error
      reject({
        message: `Error getting "${collection}": ${err.message}`,
      });
    }
  });
};

module.exports = { getCollection };
