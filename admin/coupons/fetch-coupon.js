const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
* ADMIN: FETCH COUPON
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - couponId: <string>
/* ========================================================================== */
const fetch_coupon = async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Confirm Required Fields
      const { couponId } = request.body;
      if (!couponId) throw new Error("Missing Coupon ID.");

      // Fetch Coupon
      const coupon = await getDocument("Coupons", couponId);

      // Log Success
      logSuccess("admin-fetch-oupon", "Successfully fetched coupon:", couponId);

      // Send Response
      response.status(200).json(coupon);

      // Handle Error
    } catch (err) {
      logError("admin-fetch-oupon:", err.message);
      response.status(500).send("Error fetching coupon.");
    }
  }


  module.exports = fetch_coupon;
