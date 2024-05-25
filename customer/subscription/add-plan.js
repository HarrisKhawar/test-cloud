const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { updateDocument } = require("../../util/firestore/update-document");
const { getDocument } = require("../../util/firestore/get-document");
const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { createPayment } = require("../../util/payments/create-payment");
const { applyCoupon } = require("../../util/coupons/apply-coupon");
const { useCoupon } = require("../../util/coupons/use-coupon");
const {
  sendNotifications,
} = require("../../util/notifications/sendNotifications");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");

/* ==========================================================================
 * CUSTOMER: ADD SUBSCRIPTION PLAN
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - plan: <string>
  - duration: <string>
  - paymentMethodId: <string>
  - code: <string>
/* ========================================================================== */
const add_subscription_plan = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { plan, duration, paymentMethodId, code } = request.body;
    if (!plan) throw new Error("Missing Plan Name");
    if (!duration) throw new Error("Missing Duration");
    if (!paymentMethodId) throw new Error("Missing Payment Method");

    // Get Customer
    const customer = await getDocument("Customers", customerId);

    // Check if user has the same plan
    if (
      customer.plan?.active &&
      customer.plan.name.toLowerCase() === plan.toLowerCase()
    )
      throw new Error("You already have this plan.");

    // Get Plan Record
    const record = await getDocument("Plans", plan.toUpperCase());

    // Get Period Dates
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + duration);

    // Create price object
    let price = {
      subtotal: record.rates[duration],
      tax: 0,
      total: record.rates[duration],
    };

    // Apply Coupon
    if (code) {
      price = await applyCoupon({
        id: code,
        price,
        tax: 0,
        customerId,
      });
    }

    // Get Description
    const description = `Subscription Fee: ${record.name} - ${duration} Months`;
    const metadata = {
      plan: record.name,
      duration: duration,
      customerId: customerId,
    };

    // Create Payment
    const payment = await createPayment({
      customer,
      amount: price.total,
      taxes: price.tax,
      description,
      bookingId: false,
      paymentMethodId: paymentMethodId,
    });

    // Create Plan Object
    const planObj = {
      active: true,
      date_created: new Date(),
      end_date: periodEnd,
      id: record.id,
      name: record.name,
      renewal_date: periodEnd,
      start_date: periodStart,
      rate: price.subtotal,
      duration: duration,
      payment: payment.id,
    };

    // Update customer document
    await updateDocument("Customers", customerId, {
      plan: planObj,
    });

    // Update Coupon
    if (code) {
      await useCoupon({
        id: code,
        price,
        customerId,
      });
    }

    // Send Notification to Customer
    const message = `Your ${plan} subscription plan has been activated.`;
    await sendNotifications({
      title: "LUXURY",
      message: message,
      customer: customer,
    });

    // Send Slack Notification
    await sendSlackNotification(
      `${customer.firstName} ${customer.lastName} subscribed to ${plan} - ID: ${payment.id}`
    );

    // Send Response
    response.status(200).json({ message: "Added subscription plan." });
  } catch (err) {
    logError("add_subscription_plan", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_subscription_plan;
