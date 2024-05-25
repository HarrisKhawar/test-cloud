const { updateDocument } = require("../../util/firestore/update-document");
const { handleRequest } = require("../request-handling/handle-request");
const { handleResponse } = require("../request-handling/handle-response");
const { logError } = require("../../util/logs/logging");

/* ==========================================================================
 * CUSTOMER: ADD PROFILE PHOTO
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - photo: <string> (url)

/* ========================================================================== */
const add_profile_photo = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { photo } = request.body;

    if (!photo) throw new Error("Missing required fields.");

    // Upload Photo
    await updateDocument("Customers", customerId, {
      photo: photo,
    });

    // Handle Response
    handleResponse(request, "add_profile_photo", "Profile Photo Added.");

    // Send Response
    response
      .status(200)
      .json({ message: "Successfully profile photo." });

    // Handle Error
  } catch (err) {
    logError("add_profile_photo:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_profile_photo;
