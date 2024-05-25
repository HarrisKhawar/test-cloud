const admin = require("firebase-admin");
const { logSuccess } = require("../logs/logging");

const deleteSubcollectionDocument = (
  collection,
  docId,
  subcollection,
  id,
  data
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!collection || !docId || !subcollection || !id ) {
        reject({
          message:
            "deleteSubcollectionDocument: Missing Collection, Doc ID, Subcollection, or ID.",
        });
        return;
      }

      // Delete Document
      const doc = await admin
        .firestore()
        .collection(collection)
        .doc(docId)
        .collection(subcollection)
        .doc(id)
        .delete();

      // Log Success
      logSuccess("deleteSubcollectionDocument:", `Deleted "${id}" from "${collection}" doc "${docId}" subcollection "${subcollection}"`);

      // Return Document ID
      resolve(doc.id);

    } catch (err) {
      // Handle Error
      reject({
        message: `Error Deleting Document from "${collection}" subcollection "${subcollection}": ${err.message}`,
      });
    }
  });
};

module.exports = { deleteSubcollectionDocument };
