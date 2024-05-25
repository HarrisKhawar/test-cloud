const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const getAccessToken = require("../../util/digisure/get-access-token");
const addDriver = require("../../util/digisure/add-driver");
const { updateDocument } = require("../../util/firestore/update-document");
const { sendSlackNotification } = require("../../util/slack/send-slack-notification");

/* ==========================================================================
* ADMIN: SCREEN CUSTOMER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - customerId: <string>
/* ========================================================================== */
const start_screening = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { customerId } = request.body;
    if (!customerId) throw new Error("Missing Customer ID.");

    // Fetch Customer
    const customer = await getDocument("Customers", customerId);

    // Get Access Token
    const token = await getAccessToken();

    // Add Driver
    const driverInfo = await addDriver(token, customer);

    // Update Customer
    updateDocument("Customers", customerId, {
      screening: {
        id: driverInfo.id,
        status: driverInfo.approval_status,
        date_started: driverInfo.created_at,
      },
    });

    // Send Slack Notification
    await sendSlackNotification(`Screening started for ${customer.firstName} ${customer.lastName}`, "#admin");

    // Send Response
    response
      .status(200)
      .json({ message: "Successfully started screened customer." });

    // Handle Error
  } catch (err) {
    logError("admin_screening_customer", err.message);
    response.status(500).send("Error screening customer.");
  }
};

module.exports = start_screening;
