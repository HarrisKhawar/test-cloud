const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { handleRequest } = require("../request-handling/handle-request");
const { updateDocument } = require("../../util/firestore/update-document");
const { sendSlackNotification } = require("../../util/slack/send-slack-notification");
const { createAgreement } = require("../../util/partners/create-agreement");
/* ==========================================================================
 * PARTNER: GENERATE AGREEMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - signature: <string> (URL)
/* ========================================================================== */
const generate_agreement = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const { signature } = request.body;

    if (!signature) throw new Error("Missing signature!");

    const partner = await getDocument("Partners", partnerId);
    const agreement = await createAgreement(partner, signature);

    await updateDocument("Partners", partnerId, {
      signature: signature,
      agreement: agreement,
    });

    // Send Slack Notification
    await sendSlackNotification(partner.name + " signed the partner agreement.")

    // Log Success
    logSuccess("generate_agreement", "Successfully generated agreement.");

    // Send Response
    response.status(200).json({ agreement: agreement });

    // Handle Error
  } catch (err) {
    logError("generate_partner_agreement", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = generate_agreement;
