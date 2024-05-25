const admin = require("firebase-admin");
const { logSuccess } = require("../logs/logging");

const updateSubcollectionDocument = (
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
            "updateSubcollectionDocument: Missing Collection, Doc ID, Subcollection or Data.",
        });
        return;
      }

      // Update Document
      await admin
        .firestore()
        .collection(collection)
        .doc(docId)
        .collection(subcollection)
        .doc(id)
        .update(data);

      // Log Success
      logSuccess(
        "updateSubcollectionDocument",
        [
          `Updated "${id}" in "${subcollection}" of "${collection}" doc "${docId}":`,
        ],
        data
      );

      // Return Document ID
      resolve(id);
    } catch (err) {
      // Handle Error
      reject({
        message: `Error Updating Data to "${subcollection}" of "${collection}": ${err.message}`,
      });
    }
  });
};

module.exports = { updateSubcollectionDocument };
