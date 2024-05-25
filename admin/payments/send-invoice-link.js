const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { sendMessage } = require("../../util/twilio/send-message");

/* ==========================================================================
* ADMIN: SEND PAYMENT LINK
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - paymentId: <string>
/* ========================================================================== */
const send_link = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { paymentId } = request.body;
    if (!paymentId) throw new Error("Missing Payment ID.");

    // Fetch payment
    const payment = await getDocument("Payments", paymentId);
    const customer = await getDocument("Customers", payment.customer.id);

    if (payment.type !== "invoice")
      throw new Error("Link can be sent only for invoices.");

    const link = `https://poshcars.io/dashboard/invoice/${paymentId}`;
    const message = `Hi ${customer.firstName}, please click this link to pay your invoice: ${link}`;
    await sendMessage(customer.phone, message);

    // Log Success
    logSuccess("admin-send-link", "Successfully sent payment link:", paymentId);

    // Send Response
    response.status(200).json({ message: "Successfully sent payment link." });

    // Handle Error
  } catch (err) {
    logError("admin-send-link:", err.message);
    response.status(500).send("Error sending payment link.");
  }
};

module.exports = send_link;
