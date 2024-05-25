const validateAddPayment = (request) => {
  // #region ==================== Validate Request Body ====================
  if (!request.customerId) {
    console.error("Invalid Request: Customer ID not provided.");
    throw new Error("Invalid Request: Customer ID not provided.");
  }
  if (!request.amount) {
    console.error("Invalid Request: Amount not provided.");
    throw new Error("Invalid Request: Amount not provided.");
  }
  if (!request.description) {
    console.error("Invalid Request: Description not provided.");
    throw new Error("Invalid Request: Description not provided.");
  }
  if (!request.type) {
    console.error("Invalid Request: Type not provided.");
    throw new Error("Invalid Request: Type not provided.");
  }
  if (request.type === "payment" && !request.payment_method_id) {
    console.error("Invalid Request: Payment Method ID not provided.");
    throw new Error("Invalid Request: Payment Method ID not provided.");
  }
  if (request.type === "invoice" && !request.days_until_due) {
    console.error("Invalid Request: Due Date not provided.");
    throw new Error("Invalid Request: Due Date not provided.");
  }
  // #endregion

  return true;
};

module.exports = { validateAddPayment };
