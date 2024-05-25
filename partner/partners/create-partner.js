const { logError } = require("../../util/logs/logging");
const { documentExists } = require("../../util/firestore/document-exists");
const { setDocument } = require("../../util/firestore/set-document");
const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess } = require("../../util/logs/logging");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
/* ==========================================================================
 * PARTNER: CREATE PARTNER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - name: <string>
    - dob: <string> (YYYY-MM-DD)
    - phone: <string>
    - email: <string>
    - address: <string>
    - code: <string>
/* ========================================================================== */
const create_partner = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const { name, dob, phone, email, address, code } = request.body;
    if (!name || !dob || !phone || !email || !address || !code)
      throw new Error("Missing required fields.");

    // Check if Customer Exists
    if (await documentExists("Partners", partnerId))
      throw new Error("Partner already exists.");

    // Check if code is correct
    if (code.localeCompare("POSH2023PARTNER") !== 0)
      throw new Error("Incorrect invitation code.");

    // Add customer to database
    await setDocument("Partners", partnerId, {
      id: partnerId,
      name: name,
      phone: phone,
      email: email,
      address: address,
      dob: dob,
      date_created: new Date(),
    });

    // Send Slack Notification
    await sendSlackNotification("Partner created: " + name);

    // Log Success
    logSuccess("create_partner", "Successfully created partner.");

    // Send Response
    response.status(200).json({ partnerId: partnerId });

    // Handle Error
  } catch (err) {
    logError("create_partner:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = create_partner;
