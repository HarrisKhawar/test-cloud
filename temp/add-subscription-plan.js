const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getCustomer } = require("../models/get-customer");
const { getDocument } = require("../util/firestore/get-document");
const { handleRequest } = require("../customer/request-handling/handle-request");
const {
  validatePromoCode,
} = require("../util/validation/validate-promo-code");
const { updateDocument } = require("../util/firestore/update-document");
const { logError } = require("../util/logs/logging");
const { handleResponse } = require("../customer/request-handling/handle-response");
const getUnixTime = require("date-fns/getUnixTime");

/* ==========================================================================
 * CUSTOMER: ADD SUBSCRIPTION PLAN
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - plan: {
    name: <string>
    trial: boolean
    promo_code: <string>
  }
/* ========================================================================== */
const add_subscription_plan = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { plan } = request.body;
    if (!plan || !plan.name) throw new Error("Missing Plan Information");
    if (typeof plan.name != "string") throw new Error("Invalid Plan Name");
    plan.name = plan.name.toUpperCase();

    // Get Customer
    const customer = getCustomer(await getDocument("Customers", customerId));

    // Check if user has a subscription
    if (customer.plan?.active) throw new Error("User already has a plan.");

    // Check user has payment method
    if (!customer.default_payment_method)
      throw new Error("User does not have a default payment.");

    // Get Plan Record
    const record = await getDocument("Plans", plan.name.toUpperCase());

    // Create Subscription Object
    const subscription = {
      customer: customer.stripeId,
      items: [
        {
          price: record[process.env.STRIPE_PRODUCT_ID || "priceId"],
        },
      ],
      default_payment_method: customer.default_payment_method.id,
      description: `${plan.name} plan subscription.`,
      off_session: true,
      metadata: {
        customerId: customer.id,
      },
    };

    // Get Next Month
    const currentDate = new Date();
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate()
    );

    // Check if plan is trial
    if (plan.trial) {
      // Check if promo code is valid
      if (!validatePromoCode(plan.promo_code))
        throw new Error("Invalid Promo Code.");

      subscription.trial_end = getUnixTime(nextMonth);
    }

    // Create Subscription
    const subscriptionResponse = await stripe.subscriptions.create(
      subscription
    );

    // Create Plan Object
    const planObj = {
      active: true,
      date_created: new Date(),
      end_date: null,
      id: record.id,
      name: plan.name,
      renewal_date: nextMonth,
      start_date: new Date(),
      subscriptionId: subscriptionResponse.id,
      trial: plan.trial,
      rate: record.rates.monthly,
    };

    // Check if subscription is active
    if (
      subscriptionResponse.status === "active" ||
      subscriptionResponse.status === "trialing"
    ) {
      // Update Customer
      await updateDocument("Customers", customer.id, {
        plan: planObj,
      });
    } else {
      throw new Error("Subscription creation failed.");
    }

    // Handle Response
    handleResponse(
      request,
      "add_subscription_plan",
      "Successfully added subscription plan."
    );

    // Send Response
    response.status(200).json({ message: "Added subscription plan." });
  } catch (err) {
    logError("add_subscription_plan", err);
    response.status(500).send(err.message);
  }
};

module.exports = add_subscription_plan;
