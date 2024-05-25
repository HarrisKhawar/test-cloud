const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { updateDocument } = require("../../util/firestore/update-document");
const { formatPhoneNumber } = require("../../util/phone-numbers/format-phone-number");
/* ==========================================================================
 * PARTNER: EDIT PARTNER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
  - phone: <string>
  - photoURL: <link>
/* ========================================================================== */
const edit_partner = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const { phone, photoURL } = request.body;
    if (!phone && !photoURL) throw new Error("Missing required fields.");
    let formattedPhone = formatPhoneNumber(phone);

    // Update Partner
    await updateDocument("Partners", partnerId, {
      phone: formattedPhone,
      photoURL: photoURL,
    });

    // Send Response
    response.status(200).json({ message: "Done" });

    // Handle Error
  } catch (err) {
    logError("edit_partner", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = edit_partner;
