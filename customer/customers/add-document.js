const { updateDocument } = require("../../util/firestore/update-document");
const {
  validateStorageURL,
} = require("../../util/validation/validate-storage-url");
const { handleRequest } = require("../request-handling/handle-request");
const { handleResponse } = require("../request-handling/handle-response");
const { logError } = require("../../util/logs/logging");

/* ==========================================================================
 * CUSTOMER: ADD DOCUMENT
/* ==========================================================================
TODO: Add validation for drivers license URL

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - url: <string> (url)
  - name: <string>
  

/* ========================================================================== */
const add_document = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { url, name } = request.body;
    if (!url || !name) throw new Error("Missing required fields.");

    // Validate storage urls
    if (!validateStorageURL(url)) throw new Error("Invalid Storage URL.");

    // Add Drivers License
    await updateDocument("Customers", customerId, {
      insurance: {
        url: url,
        date_created: new Date(),
        name: name
      },
    });

    // Handle Response
    handleResponse(request, "add_document", "Insurance Document Added");

    // Send Response
    response
      .status(200)
      .json({ message: "Successfully added insurance document." });

    // Handle Error
  } catch (err) {
    logError("add_document:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_document;
