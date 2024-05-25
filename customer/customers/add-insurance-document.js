const { updateDocument } = require("../../util/firestore/update-document");
const {
  validateStorageURL,
} = require("../../util/validation/validate-storage-url");
const { handleRequest } = require("../request-handling/handle-request");
const { handleResponse } = require("../request-handling/handle-response");

/* ==========================================================================
 * CUSTOMER: ADD INSURANCE DOCUMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - document_url: <string> (url)

/* ========================================================================== */
const add_insurance_documents = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { document_url } = request.body;
    if (!document_url) throw new Error("Missing Document URL.");

    // Validate storage urls
    if (!validateStorageURL(document_url))
      throw new Error("Invalid Storage URL.");

    // Add Drivers License
    await updateDocument("Customers", customerId, {
      insurance: document_url,
    });

    // Handle Response
    handleResponse(
      request,
      "add_insurance_document",
      "Insurance Document Added"
    );

    // Send Response
    response.status(200).send("Insurance Document Added.");

    // Handle Error
  } catch (err) {
    logError("add_insurance_document:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_insurance_documents;
