const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { updateDocument } = require("../../util/firestore/update-document");
const splitAddress = require("../../util/tools/splitAddress");
/* ==========================================================================
* ADMIN: EDIT CUSTOMER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - customerId: <string>
    - phone: <string>
    - dob: <string>
    - address: <string>
    - drivers_license_number: <string>
    - drivers_license_exp: <string>
    - drivers_license_front: <string>
    - drivers_license_back: <string>
/* ========================================================================== */
const edit_customer = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const {
      customerId,
      phone,
      dob,
      address,
      drivers_license_number,
      drivers_license_exp,
      drivers_license_front,
      drivers_license_back,
    } = request.body;
    if (!customerId) throw new Error("Missing Customer ID.");

    const update = {
      phone: phone,
      dob: dob,
      address: address || "",
      drivers_license_number: drivers_license_number,
      drivers_license_exp: drivers_license_exp,
    };

    if (address) {
      // Split Address
      const splitAddr = splitAddress(address);

      // Update
      update.street = splitAddr.street;
      update.street2 = splitAddr.street2;
      update.city = splitAddr.city;
      update.state = splitAddr.state;
      update.zip = splitAddr.zip;
      update.country = splitAddr.country;
    }

    if (drivers_license_front) {
      update.drivers_license_front = drivers_license_front;
    }
    if (drivers_license_back) {
      update.drivers_license_back = drivers_license_back;
    }

    // Edit Customer Customer
    await updateDocument("Customers", customerId, update);

    // Log Success
    logSuccess(
      "admin_edit_customer",
      "Successfully edited customer:",
      customerId
    );

    // Send Response
    response.status(200).json(customerId);

    // Handle Error
  } catch (err) {
    logError("admin_edit_customer", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = edit_customer;
