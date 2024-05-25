const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { documentExists } = require("../../util/firestore/document-exists");
const { setDocument } = require("../../util/firestore/set-document");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");

/* ==========================================================================
* ADMIN: ADD COUPON
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - code: <string>
    - type: <string>
    - amount: <string>
    - reusable: <boolean>
    - forId: <string>
/* ========================================================================== */
const add_coupon = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { code, type, amount, forId, reusable } = request.body;
    if (!code || !type || !amount || reusable === undefined)
      throw new Error("Missing Required Fields.");

    // Check if coupon exists
    if (await documentExists("Coupons", code))
      throw new Error("Coupon already exists.");

    // Check code length
    if (code.length < 6)
      throw new Error("Coupon must be at least 6 characters.");

    // Check amount validity
    if (isNaN(Number(amount))) throw new Error("Amount must be a number.");
    if (type === "percentage" && Number(amount) >= 1)
      throw new Error("Percentage must be less than 1.");
    if (type === "fixed" && Number(amount) <= 0)
      throw new Error("Amount must be greater than 0.");

    // Check forId validity
    if (forId && !(await documentExists("Customers", forId)))
      throw new Error("Customer does not exist.");

    // Add Coupon
    const coupon = {
      code,
      type,
      amount,
      reusable,
    };
    if (forId) {
      coupon.forId = forId;
      const customer = await getDocument("Customers", forId);
      coupon.customer = `${customer.firstName} ${customer.lastName}`;
    }
    await setDocument("Coupons", code, coupon);

    // Log Success
    logSuccess("admin_add_coupon", "Successfully added coupon: ", code);
    await sendSlackNotification("Admin added new coupon: " + code);

    // Send Response
    response.status(200).json({ id: code });

    // Handle Error
  } catch (err) {
    logError("admin-add-coupon:", err.message);
    response.status(500).send("Error adding coupon: " + err.message);
  }
};

module.exports = add_coupon;
