const { logError, logSuccess, logInfo } = require("../util/logs/logging");
const {
  update_payment_status,
} = require("../util/payments/update-payment-status");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* ==========================================================================
 * WEBHOOK: STRIPE EVENTS
/* ========================================================================== */

const stripe_events = async (request, response) => {
  try {
    // Log Request
    logInfo("stripe_webhook", "Webhook received.");

    // Grab the signature from the header
    const endpointSecret = "whsec_e5cd3e638624327f03cf9f2618e6d716e4ac17ed8a3bbeef0572ba9cdc52d660";
    const sig = request.headers["stripe-signature"];
    console.log(sig);
    console.log(request.body);

    // Construct the event
    const event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      endpointSecret
    );

    // Handle the event
    switch (event.type) {
      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        const payment = await update_payment_status(invoice.id, "succeeded");
        logSuccess(
          "stripe_webhook",
          "Invoice payment succeeded: " + payment.id
        );
        break;
      default:
        logInfo("stripe_webhook", "Unhandled event type: " + event.type);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();

    // Catch any errors
  } catch (err) {
    logError("stripe_webhook", err.message);
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
};

module.exports = stripe_events;
