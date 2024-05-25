const { handleRequest } = require("../request-handling/handle-request");
const { getVehicle } = require("../../models/get-vehicle");
const { setDocument } = require("../../util/firestore/set-document");
const { logSuccess, logError } = require("../../util/logs/logging");
/* ==========================================================================
* ADMIN: ADD BRAND
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - name: <string>
    - image: <string>
/* ========================================================================== */
const add_brand = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { name, image } = request.body;
    if (!name || !image) throw new Error("Missing Required Fields.");

    // Add Brand
    const id = name.toLowerCase().replace(/ /g, "");
    const brandId = await setDocument("Brands", name, { id, name, image });

    // Log Success
    logSuccess("admin_add_brand", "Successfully added brand: ", brandId);

    // Send Response
    response.status(200).json({ brandId: brandId });

    // Handle Error
  } catch (err) {
    logError("admin-add-brand:", err.message);
    response.status(500).send("Error Adding Brand.");
  }
};

module.exports = add_brand;
