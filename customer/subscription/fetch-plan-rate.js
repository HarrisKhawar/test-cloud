const { getDocument } = require("../../util/firestore/get-document");
const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { applyCoupon } = require("../../util/coupons/apply-coupon");

/* ==========================================================================
 * CUSTOMER: FETCH PLAN RATE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - plan: <string>
  - duration: <string>
  - code: <string>
/* ========================================================================== */
const fetch_plan_rate = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { plan, duration, code } = request.body;
    if (!plan) throw new Error("Missing Plan Information");
    if (!duration) throw new Error("Missing Duration");

    // Get Plan Record
    const record = await getDocument("Plans", plan.toUpperCase());

    // Get Plan Rate
    const total = record.rates[duration];
    const rate = Number(Number(total) / Number(duration)).toFixed(2);

    // Create price object
    let price = {
      subtotal: total,
      rate: rate,
      tax: 0,
      total: total,
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

    // Send Response
    response.status(200).json(price);
  } catch (err) {
    logError("fetch-plan-rate", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_plan_rate;
