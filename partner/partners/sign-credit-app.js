const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { handleRequest } = require("../request-handling/handle-request");
const { updateDocument } = require("../../util/firestore/update-document");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const {
  createCreditAppAgreement,
} = require("../../util/partners/create-credit-app-agreement");
/* ==========================================================================
 * PARTNER: SIGN CREDIT APP
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - signature: <string> (URL)
/* ========================================================================== */
const sign_credit_app = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const { signature } = request.body;

    if (!signature) throw new Error("Missing signature!");

    const partner = await getDocument("Partners", partnerId);
    if (!partner.dob || !partner.drivers_license_number || !partner.ssn)
      throw new Error(
        "Missing required information. Please complete Credit Application first."
      );

    const agreement = await createCreditAppAgreement(partner, signature);
    console.log(agreement);

    await updateDocument("Partners", partnerId, {
      credit_app_agreement: agreement,
    });

    // Send Slack Notification
    await sendSlackNotification(
      partner.name + " signed the credit app agreement."
    );

    // Log Success
    logSuccess("sign_credit_app", "Successfully generated agreement.");

    // Send Response
    response.status(200).json({ agreement: agreement });

    // Handle Error
  } catch (err) {
    logError("sign_credit_app_agreement", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = sign_credit_app;
