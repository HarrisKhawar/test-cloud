const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { sendMessage } = require("../../util/twilio/send-message");

/* ==========================================================================
* ADMIN: SEND MESSAGE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - customerId: <string>
    - message: <string>
/* ========================================================================== */
const send_message = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { customerId, message } = request.body;
    if (!customerId) throw new Error("Missing Customer ID.");
    if (!message) throw new Error("Missing message.");

    // Fetch Customer
    const customer = await getDocument("Customers", customerId);
    if (!customer.phone)
      throw new Error("Customer does not have a phone number.");

    // Send Message
    await sendMessage(message, customer.phone);

    // Log Success
    logSuccess("admin_send_message", `Sent Message to ${customer.firstName} ${customer.lastName}: ${message}`);

    // Send Response
    response.status(200).json(customer);

    // Handle Error
  } catch (err) {
    logError("admin_send_message:", err.message);
    response.status(500).send("Error sending message to customer.");
  }
};

module.exports = send_message;
