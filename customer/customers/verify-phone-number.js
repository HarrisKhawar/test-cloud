const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { verifyCode } = require("../../util/phone-numbers/verify-code");
const { handleResponse } = require("../request-handling/handle-response");
/* ==========================================================================
 * CUSTOMER: VERIFY PHONE NUMBER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - phone: <string>
    - code: <string>
/* ========================================================================== */
const verify_phone_number = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { phone, code } = request.body;
    if (!phone || !code) throw new Error("Missing Phone Number or Code.");

    // Verify Phone Number
    await verifyCode(code, phone, customerId);

    // Handle Response
    handleResponse(
      request,
      "verify_phone_number",
      "Phone Number Verified: " + phone
    );

    // Send Response
    response.status(200).json({ phone: phone });

    // Handle Error
  } catch (err) {
    logError("verify_phone_number:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = verify_phone_number;
