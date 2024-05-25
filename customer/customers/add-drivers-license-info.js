const { getDocument } = require("../../util/firestore/get-document");
const { updateDocument } = require("../../util/firestore/update-document");
const { logError, logSuccess } = require("../../util/logs/logging");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const {
  checkDatePassed,
  checkDateFormat,
} = require("../../util/tools/checkDate");
const splitAddress = require("../../util/tools/splitAddress");
const { handleRequest } = require("../request-handling/handle-request");

/* ==========================================================================
* CUSTOMER: ADD DRIVERS LICENSE INFO
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userid: <string>
    
* Request Body:
    - drivers_license_number: <string>
    - drivers_license_exp: <string>
    - dob: <string>
    - address: <string>
/* ========================================================================== */
const add_drivers_license_info = async (request, response) => {
  try {
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const { drivers_license_number, drivers_license_exp, dob, address } =
      request.body;

    if (!drivers_license_number)
      throw new Error("Missing Drivers License Number.");
    if (!drivers_license_exp)
      throw new Error("Missing Drivers License Expiration.");
    if (!dob) throw new Error("Missing Date of Birth.");
    if (!address) throw new Error("Missing Address.");

    // Get Customer
    const customer = await getDocument("Customers", customerId);

    // Check Date formats
    if (checkDatePassed(drivers_license_exp))
      throw new Error("Driver's License is Expired.");
    if (!checkDateFormat(dob)) throw new Error("Invalid Date of Birth Format.");

    // Format Address
    const splitAddr = splitAddress(address);

    // Update Customer
    let customerUpdate = {};
    customerUpdate.drivers_license_number = drivers_license_number;
    customerUpdate.drivers_license_exp = drivers_license_exp;
    customerUpdate.dob = dob;
    customerUpdate.street = splitAddr.street;
    customerUpdate.street2 = splitAddr.street2;
    customerUpdate.city = splitAddr.city;
    customerUpdate.state = splitAddr.state;
    customerUpdate.zip = splitAddr.zip;
    customerUpdate.country = splitAddr.country;
    customerUpdate.address = address;

    await updateDocument("Customers", customerId, customerUpdate);

    // Send Slack Notification
    await sendSlackNotification(
      `${customer.firstName} ${customer.lastName}: Added Drivers License Information.`
    );

    // Log Success
    logSuccess("add-drivers-license-info", "Drivers License Info Added.");

    // Send Response
    response.status(200).json({ message: "Drivers License Info Added." });
  } catch (err) {
    logError("add-drivers-license-info", err);
    response.status(500).send(err.message);
  }
};

module.exports = add_drivers_license_info;
