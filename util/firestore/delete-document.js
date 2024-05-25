const admin = require("firebase-admin");
const { logSuccess } = require("../logs/logging");

const deleteDocument = async (collection, docId) => {
  return new Promise(async (resolve, reject) => {
    try {

      // Confirm Required Fields
      if (!collection || !docId) {
        reject({
          message: "deleteDocument: Missing Collection or Doc ID.",
        });
        return;
      }
      
      // Get Document
      const document = await admin
        .firestore()
        .collection(collection)
        .doc(docId)
        .get();

      // Confirm Document Exists
      if (!document.exists) {
        reject("Document does not exist.");
        return;
      }

      // Add Document to Deleted Collection
      await admin
        .firestore()
        .collection("Deleted")
        .doc(collection)
        .collection("Documents")
        .doc(docId)
        .set(document.data());

      // Delete Document
      await admin.firestore().collection(collection).doc(docId).delete();

      // Log Success
      logSuccess(
        "deleteDocument:",
        `Deleted "${docId}" from "${collection}" collection.`
      );

      // Return Deleted Document ID
      resolve(docId);
    } catch (err) {
      reject({
        message: `Error Deleting Document: ${err.message}`,
      });
    }
  });
};

module.exports = { deleteDocument };
