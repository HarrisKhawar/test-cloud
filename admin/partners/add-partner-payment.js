const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { setSubcollectionDocument } = require("../../util/firestore/set-subcollection-document");
const { setDocument } = require("../../util/firestore/set-document");
const { constructDateObject } = require("../../util/tools/construct-date-object");

/* ==========================================================================
* ADMIN: ADD PARTNER PAYMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - id: <string>
    - partnerId: <string>
    - amount: <string>
    - description: <string>
    - date_paid: <string>
    - paid_via: <string>
    - attachment: <string>
    
/* ========================================================================== */
const add_partner_payment = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    const { id, partnerId, amount, description, date_paid, paid_via, attachment } =
      request.body;

    // Confirm Required Fields
    if (!id || !partnerId || !amount || !description || !date_paid || !paid_via)
      throw new Error("Missing required fields.");

    // Get Partner
    const partner = await getDocument("Partners", partnerId);

    // Construct Date Object
    const date = constructDateObject(date_paid, "00:00:00");

    // Create Payment
    const payment = {
      id,
      date_created: new Date(),
      partner: {
        id: partnerId,
        name: partner.name,
      },
      amount, 
      description,
      date_paid: date,
      paid_via,
      attachment: attachment || false,
      status: "succeeded",
    };

    // Add Payment to Partner
    await setSubcollectionDocument("Partners", partnerId, "Payments", id, payment);
    await setDocument("Invoices", id, payment);

    // Log Success
    logSuccess("admin-add-partner-payment", "Successfully added payment for partner.");

    // Send Response
    response.status(200).json(payment);

    // Handle Error
  } catch (err) {
    logError("admin-add-partner-payment:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_partner_payment;
