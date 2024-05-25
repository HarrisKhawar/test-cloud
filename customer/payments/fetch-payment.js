const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { getDocument } = require("../../util/firestore/get-document");
const { applyCoupon } = require("../../util/coupons/apply-coupon");
/* ==========================================================================
 * CUSTOMER: FETCH PAYMENT
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - id: <string>
    - code: <string>
/* ========================================================================== */
const fetch_payment = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Get Customer ID and Payment ID
    const { userid: customerId } = request.headers;
    const { id, code } = request.body;

    // Fetch Payment
    const payment = await getDocument("Payments", id);

    // Check if Payment belongs to the Customer
    if (customerId !== payment?.customer?.id)
      throw new Error("Invalid Request: Record does not belong to customer.");

    // Check if payment is invoice
    if (code) {
      const tax = Number(Number(payment.amount) / Number(payment.subtotal) - 1);
      console.log(tax);
      const price = await applyCoupon({
        id: code,
        price: payment,
        tax: tax,
        customerId: customerId,
      });
      payment.discount = price.discount;
      payment.subtotal = price.subtotal;
      payment.taxes = price.tax;
      payment.amount = price.total;
    }

    // Send Response
    response.status(200).json(payment);

    // Handle Error
  } catch (err) {
    logError("fetch_payment", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_payment;
