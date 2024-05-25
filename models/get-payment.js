const getPayment = (data) => {
  try {
    const payment = {
      id: data.id,
      date_created: data.date_created,
      amount: data.amount,
      description: data.description,
      metadata: data.metadata,
      payment_method: data.payment_method,
      days_until_due: data.days_until_due,
      status: data.status,
      type: data.type,
      invoice: data.invoice,
      payment_intent: data.payment_intent,
      customer: {
        id: data.customer.id,
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        email: data.customer.email,
        phone: data.customer.phone,
        stripeId: data.customer.stripeId,
      },
    };

    return payment;
  } catch (err) {
    throw new Error(`Error formatting payment object: ${err.message}`);
  }
};

module.exports = { getPayment };
