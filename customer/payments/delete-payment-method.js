const { updateDocument } = require("../../util/firestore/update-document");
const { getDocument } = require("../../util/firestore/get-document");
const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { handleResponse } = require("../request-handling/handle-response");
/* ==========================================================================
 * CUSTOMER: DELETE PAYMENT METHOD
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - id: <string>
  
/* ========================================================================== */
const delete_payment_method = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { id } = request.body;
    if (!id) throw new Error("Missing Payment Method ID.");

    // Get Customer
    const customer = await getDocument("Customers", customerId);

    // Delete Payment Method Record
    if (customer.default_payment_method?.id === id)
      throw new Error("Cannot delete default payment method.");
    if (!customer.payment_methods) throw new Error("Payment Method not found.");
    let newPaymentMethodsArr = [];
    customer.payment_methods.forEach((payment) => {
      if (payment.id !== id) newPaymentMethodsArr.push(payment);
    });

    // Update Customer
    await updateDocument("Customers", customerId, {
      payment_methods: newPaymentMethodsArr,
    });

    // Handle Response
    handleResponse(
      request,
      "delete_payment_method",
      "Payment Method Deleted Successfully."
    );

    // Send Response
    response
      .status(200)
      .json({ message: "Payment Method Deleted Successfully.", id: id });
  } catch (err) {
    logError("delete_payment_method", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = delete_payment_method;
