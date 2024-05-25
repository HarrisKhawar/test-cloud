const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { logError } = require("../../util/logs/logging");
const { handleRequest } = require("../request-handling/handle-request");
const { documentExists } = require("../../util/firestore/document-exists");
const {
  sendVerificationCode,
} = require("../../util/phone-numbers/send-verification-code");
const { setDocument } = require("../../util/firestore/set-document");
const { handleResponse } = require("../request-handling/handle-response");
/* ==========================================================================
 * CUSTOMER: CREATE CUSTOMER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - firstName: <string>
    - lastName: <string>
    - email: <string>
    - phone: <string>
    - address: <string>
    - 
    }
/* ========================================================================== */
const create_customer = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { firstName, lastName, email, phone } = request.body;
    if (!firstName || !lastName || !email || !phone)
      throw new Error("Missing required fields.");

    // Check if Customer Exists
    if (await documentExists("Customers", customerId))
      throw new Error("Customer already exists.");

    // Send Verification Code
    await sendVerificationCode(phone);

    // Create customer in stripe
    const stripeCustomer = await stripe.customers.create({
      email: email,
      name: `${firstName} ${lastName}`,
      metadata: {
        customerId: customerId,
      },
    });

    // Add customer to database
    await setDocument("Customers", customerId, {
      id: customerId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      stripeId: stripeCustomer.id,
      date_created: new Date(),
      notifications: {
        push: true,
        email: true,
        sms: true,
        tokens: [],
      }
    });

    // Handle Response
    handleResponse(request, "create_customer", "Customer created.");

    // Send Response
    response.status(200).json({ customerId: customerId });

    // Handle Error
  } catch (err) {
    logError("create_customer:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = create_customer;
