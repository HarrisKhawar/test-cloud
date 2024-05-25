const { handleRequest } = require("./request-handling/handle-request");
const { getCollection } = require("../util/firestore/get-collection");
const { logSuccess, logError } = require("../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH BOOKINGS, CUSTOMERS, VEHICLES & TOLLS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_data = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Fetch All Data
    const bookings = await getCollection("Bookings");
    const customers = await getCollection("Customers");
    const partners = await getCollection("Partners");
    const vehicles = await getCollection("Vehicles");
    const brands = await getCollection("Brands");
    const payments = await getCollection("Payments");
    const coupons = await getCollection("Coupons");
    const invoices = await getCollection("Invoices");
    const tolls = await getCollection("Tolls");
    const charging = await getCollection("Charging");
    const expenses = await getCollection("Expenses");

    // Remove Toll with id Latest
    tolls.forEach((toll) => {
      if (toll.id === "latest") {
        tolls.splice(tolls.indexOf(toll), 1);
      }
    });

    // Remove Charging with id Latest
    charging.forEach((charge) => {
      if (charge.id === "latest") {
        charging.splice(charging.indexOf(charge), 1);
      }
    });

    // Create Response Object
    const data = {
      bookings,
      customers,
      partners,
      vehicles,
      brands,
      payments,
      coupons,
      invoices,
      tolls,
      charging,
      expenses,
    };

    // Log Success
    logSuccess("fetchAllData", "Successfully fetched all data.");

    // Send Response
    response.status(200).json(data);

    // Handle Error
  } catch (err) {
    logError("fetchAllData", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_all_data;
