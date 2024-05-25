const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { handleRequest } = require("../request-handling/handle-request");
const { applyCoupon } = require("../../util/coupons/apply-coupon");

// ! This Endpoint is only used in the POSH APP
/* ==========================================================================
 * CUSTOMER: FETCH PRICE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - vehicleId: <string>
    - period: <string>
    - code: <string>
    - delivery: <object>
        - pickup: <string>
        - dropoff: <string>
/* ========================================================================== */
const fetch_price = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { vehicleId, period, code, delivery } = request.body;
    if (!vehicleId) throw new Error("Missing Vehicle ID.");
    if (!period) throw new Error("Missing Period.");

    // Fetch Vehicle
    const vehicle = await getDocument("Vehicles", vehicleId);
    const location = await getDocument("Locations", vehicle.location);

    // Construct price object
    let price = {};

    // Calculate Price
    if (period.toLowerCase() !== "monthly" && period.toLowerCase() !== "weekly")
      throw new Error("Invalid Period.");
    // Subtotal = Vehicle[Period] Rate
    price.subtotal = Number(vehicle.rates[period.toLowerCase()]).toFixed(2);
    // Tax = Subtotal * Location Tax
    price.tax = Number(Number(price.subtotal) * Number(location.tax)).toFixed(2);
    // Total = Subtotal + Tax
    price.total = Number(Number(price.subtotal) + Number(price.tax)).toFixed(2);

    // Add discount
    if (code) {
      price = await applyCoupon({
        id: code,
        price,
        tax: Number(location.tax),
        customerId,
      });
    }

    // Add Delivery
    if (delivery?.pickUp) {
      price.delivery = location.delivery.rate;
      price.total = Number(Number(price.total) + Number(location.delivery.rate)).toFixed(2);
      pickUp = delivery.pickUp;
    }
    if (delivery?.dropOff) {
      price.delivery
        ? (price.delivery += location.delivery.rate)
        : (price.delivery = location.delivery.rate);
        price.total = Number(Number(price.total) + Number(location.delivery.rate)).toFixed(2);
      dropOff = delivery.dropOff;
    }

    // Log Success
    logSuccess("fetch_price_app", "Successfully fetched Price.");

    // Send Response
    response.status(200).json(price);

    // Handle Error
  } catch (err) {
    logError("fetch_booking", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_price;
