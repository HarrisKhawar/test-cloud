const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { setDocument } = require("../../util/firestore/set-document");
const { updateDocument } = require("../../util/firestore/update-document");

/* ==========================================================================
* ADMIN: FETCH CUSTOMER
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - customerId: <string>
/* ========================================================================== */
const add_to_dnr = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { customerId } = request.body;
    if (!customerId) throw new Error("Missing Customer ID.");

    // Fetch Customer
    const customer = await getDocument("Customers", customerId);

    const dnr = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      drivers_license_number: customer.drivers_license_number || "",
      dob: customer.dob || "",
      id: customer.id,
    };
    await setDocument("DNR", customer.drivers_license_number, dnr);
    await updateDocument("Customers", customerId, { dnr: true });

    // Log Success
    logSuccess(
      "admin_add_to_dnr",
      "Successfully added customer to Do Not Rent List:",
      customerId
    );

    // Response
    response
      .status(200)
      .json({ message: "Successfully added customer to Do Not Rent List." });

    // Handle Error
  } catch (err) {
    logError("admin_fetch_customer:", err.message);
    response.status(500).send("Error fetching customer.");
  }
};

module.exports = add_to_dnr;
