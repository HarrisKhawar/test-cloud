const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const getAccessToken = require("../../util/digisure/get-access-token");
const { updateDocument } = require("../../util/firestore/update-document");
const checkScreeningStatus = require("../../util/digisure/check-status");
const { sendSlackNotification } = require("../../util/slack/send-slack-notification");

/* ==========================================================================
* ADMIN: CHECK SCREENING STATUS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - customerId: <string>
/* ========================================================================== */
const check_screening_status = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { customerId } = request.body;
    if (!customerId) throw new Error("Missing Customer ID.");

    // Fetch Customer
    const customer = await getDocument("Customers", customerId);
    if (!customer.screening) throw new Error("Customer has not been screened.");

    // Get access Token
    const token = await getAccessToken();

    // Check status
    const status = await checkScreeningStatus(token, customerId);

    // Update Customer
    await updateDocument("Customers", customerId, {
      "screening.status": status.approval_status,
      "screening.decline_reasons": status.decline_reasons,
    });

    // Send Slack Notification
    await sendSlackNotification(`Customer ${customer.firstName} ${customer.lastName}'s screening status is '${status.approval_status}'`, "#admin");

    // Send Response
    response
      .status(200)
      .json({ message: "Successfully checked screening status." });

    // Handle Error
  } catch (err) {
    logError("admin_check_screening", err.message);
    response.status(500).send("Error checking screening status.");
  }
};

module.exports = check_screening_status;
