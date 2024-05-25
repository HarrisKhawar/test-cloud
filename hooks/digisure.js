const { updateDocument } = require("../util/firestore/update-document");
const { logError } = require("../util/logs/logging");
const { documentExists } = require("../util/firestore/document-exists");
const { sendSlackNotification } = require("../util/slack/send-slack-notification");
const { getDocument } = require("../util/firestore/get-document");
/* ==========================================================================
* DIGISURE: SCREENING STATUS WEBHOOK
/* ==========================================================================

* Request Headers: 

* Request Body:

/* ========================================================================== */

const digisure_screening = async (request, response) => {
  try {
    const { reference, event } = request.body;
    console.log("Incoming Webhook DIGISURE:")
    console.log(request.body);
    
    if (!reference || !event) {
      logError("digisure_screening_webhook", "Missing reference or event.");
      response.status(200).send("OK");
      return;
    }

    // Ignore unhandled events
    if (event.split(".")[0] !== "driver" && event.split(".")[0] !== "renter" && event.split(".")[0] !== "ivm") {
      response.status(200).send("OK");
      return;
    }
    if (event.split(".")[1] !== "trustscore" && event.split(".")[1] !== "complete") {
      response.status(200).send("OK");
      return;
    }

    const digisureDriverId = reference.id;
    const customerId = reference.partner_driver_id;
    const status = reference.approval_status;

    // Ignore if no customer ID or customer does not exist
    if (!customerId || !documentExists("Customers", customerId)) {
      logError("digisure_screening_webhook", `Customer does not exist. Digisure ID: ${digisureDriverId}}`);
      response.status(200).send("OK");
      return;
    }

    // Fetch Customer
    const customer = await getDocument("Customers", customerId);

    // Update Customer Object
    await updateDocument("Customers", customerId, {
      "screening.status": status,
      "screening.id": digisureDriverId,
      "screening.decline_reasons": reference.decline_reasons | [],
    });

    // Send Slack Notification
    await sendSlackNotification(`Customer ${customer.firstName} ${customer.lastName}'s screening status is '${status}' - ${customer.id}`);

    response.status(200).send("OK");
  } catch (err) {
    logError("digisure_screening_webhook", err.message);
    response
      .status(400)
      .send(`Error resolving webhook from Digisure: ${err.message}`);
  }
};

module.exports = digisure_screening;
