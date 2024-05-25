const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const {
  sendVerificationCode,
} = require("../../util/phone-numbers/send-verification-code");
/* ==========================================================================
 * CUSTOMER: SEND PHONE VERIFICATION CODE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - phone: <string>
/* ========================================================================== */
const send_phone_verification_code = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { phone } = request.body;
    if (!phone) throw new Error("Missing Phone Number.");

    // Send Verification Code
    await sendVerificationCode(phone);

    // Send Response
    response.status(200).json({ message: "Verification code sent." });

    // Handle Error
  } catch (err) {
    logError("get_phone_verification_code:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = send_phone_verification_code;
