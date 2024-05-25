const admin = require("firebase-admin");

const getSubcollectionDocument = (
  collection,
  docId,
  subcollection,
  id,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!collection || !docId || !subcollection || !id) {
        reject({
          message:
            "getSubcollectionDocument: Missing Collection, Doc ID, Subcollection, or ID.",
        });
        return;
      }

      // Set Document
      const doc = await admin
        .firestore()
        .collection(collection)
        .doc(docId)
        .collection(subcollection)
        .doc(id)
        .get();
      

      // Return Document ID
      resolve(doc.data());

    } catch (err) {
      // Handle Error
      reject({
        message: `Error Getting Data from "${collection}" subcollection "${subcollection}": ${err.message}`,
      });
    }
  });
};

module.exports = { getSubcollectionDocument };
