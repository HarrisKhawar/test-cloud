const admin = require("firebase-admin");
const { logSuccess } = require("../logs/logging");

const setSubcollectionDocument = (
  collection,
  docId,
  subcollection,
  id,
  data
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!collection || !docId || !subcollection || !id || !data) {
        reject({
          message:
            "setSubcollectionDocument: Missing Collection, Doc ID, Subcollection, ID or Data.",
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
        .set(data);

      // Log Success
      logSuccess("setSubcollectionDocument:", `Set "${id}" to "${collection}" doc "${docId}" subcollection "${subcollection}"`);

      // Return Document ID
      resolve(doc.id);

    } catch (err) {
      // Handle Error
      reject({
        message: `Error Setting Data to "${collection}" subcollection "${subcollection}": ${err.message}`,
      });
    }
  });
};

module.exports = { setSubcollectionDocument };
