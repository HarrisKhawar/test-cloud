const { updateDocument } = require("../../util/firestore/update-document");
const {
  validateStorageURL,
} = require("../../util/validation/validate-storage-url");
const { handleRequest } = require("../request-handling/handle-request");
const { handleResponse } = require("../request-handling/handle-response");
const { logError } = require("../../util/logs/logging");

/* ==========================================================================
 * CUSTOMER: ADD DRIVERS LICENSE
/* ==========================================================================
TODO: Add validation for drivers license URL

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - drivers_license_front: <string> (url)
  - drivers_license_back: <string> (url)
  - drivers_license_number: <string>
  - drivers_license_exp: <string>
  - street: <string>
  - city: <string>
  - state: <string>
  - zip: <string>
  - country: <string>

/* ========================================================================== */
const add_drivers_license = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: customerId } = request.headers;
    const {
      drivers_license_front,
      drivers_license_back,
      drivers_license_number,
      drivers_license_exp,
    } = request.body;
    const { street, city, state, zip, country } = request.body;
    // if (
    //   !drivers_license_front ||
    //   !drivers_license_back ||
    //   !drivers_license_number ||
    //   !drivers_license_exp ||
    //   !street ||
    //   !city ||
    //   !state ||
    //   !zip ||
    //   !country
    // )
    //   throw new Error("Missing required fields.");

    // Validate storage urls
    if (
      !validateStorageURL(drivers_license_front) ||
      !validateStorageURL(drivers_license_back)
    )
      throw new Error("Invalid Storage URL.");

    // Add Drivers License
    await updateDocument("Customers", customerId, {
      drivers_license_front,
      drivers_license_back,
      // drivers_license_number,
      // drivers_license_exp,
      // street,
      // city,
      // state,
      // zip,
      // country,
      // address: `${street}, ${city}, ${state}, ${zip}, ${country}`,
    });

    // Handle Response
    handleResponse(request, "add_drivers_license", "Drivers License Added");

    // Send Response
    response
      .status(200)
      .json({ message: "Successfully added drivers license." });

    // Handle Error
  } catch (err) {
    logError("add_drivers_license:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_drivers_license;
