const admin = require("firebase-admin");

const getSubcollection = (collection, docId, subcollection) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!collection || !docId || !subcollection) {
        reject({
          message:
            "getSubcollection: Missing Collection, Doc ID, Subcollection",
        });
        return;
      }

      // Get Subcollection Data
      const data = await admin
        .firestore()
        .collection(collection)
        .doc(docId)
        .collection(subcollection)
        .get();

      // Create array of documents
      let documents = [];
      data.forEach((document) => {
        documents.push(document.data());
      });

      // Send response
      resolve(documents);
      
    } catch (err) {
      // Handle Error
      reject({
        message: `Error getting "${collection}" doc "${docId}" subcollection "${subcollection}": ${err.message}`,
      });
    }
  });
};

module.exports = { getSubcollection };
