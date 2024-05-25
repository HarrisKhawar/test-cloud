const FieldValue = require("firebase-admin").firestore.FieldValue;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { updateDocument } = require("../../util/firestore/update-document");
const { getDocument } = require("../../util/firestore/get-document");
const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { handleResponse } = require("../request-handling/handle-response");
/* ==========================================================================
 * CUSTOMER: ADD PAYMENT METHOD
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - card: {
    number: <string>
    exp_month: <string> MM
    exp_year: <string> YYYY
    cvc: <string>
  }
  - setDefault: <boolean>
  
/* ========================================================================== */
const add_payment_method = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { card, setDefault } = request.body;
    const { number, exp_month, exp_year, cvc } = card;
    if (!number || !exp_month || !exp_year || !cvc)
      throw new Error("Missing Card Information.");

    // Get Customer
    const customer = await getDocument("Customers", customerId);

    // Add Payment Method
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number,
        exp_month,
        exp_year,
        cvc,
      },
    });

    // Confirm Payment Method
    const setupIntent = await stripe.setupIntents.create({
      payment_method: paymentMethod.id,
      customer: customer.stripeId,
      confirm: true,
    });

    // Check Status
    if (setupIntent.status !== "succeeded")
      throw new Error("Payment Method Confirmation Failed.");

    // Create Payment Method Object
    const paymentMethodObject = {
      id: paymentMethod.id,
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      type: paymentMethod.card.funding,
    };

    // If Customer Has No Default Payment Method
    if (!customer.default_payment_method) {
      // Update Default Payment Method
      await updateDocument("Customers", customerId, {
        default_payment_method: paymentMethodObject,
      });

      // If Customer has a default payment method and setDefault is true
    } else if (setDefault) {
      // Add Current Default to Payment Methods
      await updateDocument("Customers", customerId, {
        payment_methods: FieldValue.arrayUnion(
          customer.default_payment_method
        ),
      });

      // Update Default Payment Method
      await updateDocument("Customers", customerId, {
        default_payment_method: paymentMethodObject,
      });

      // If setDefault is not true
    } else {
      // Update Other Payment Methods
      await updateDocument("Customers", customerId, {
        payment_methods: FieldValue.arrayUnion(paymentMethodObject),
      });
    }

    // Handle Response
    handleResponse(
      request,
      "add_payment_method",
      "Payment Method Added Successfully."
    );

    // Send Response
    response.status(200).json(paymentMethod);
  } catch (err) {
    logError("add_payment_method", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_payment_method;
