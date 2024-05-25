const { handlePublicRequest } = require("./handle-public-request");
const { getCollection } = require("../util/firestore/get-collection");
const { logError, logSuccess } = require("../util/logs/logging");

/* ==========================================================================
* FETCH Subscription Plans
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
/* ========================================================================== */
const fetch_subscription_plans = async (request, response) => {
  try {
    if (await handlePublicRequest(request, response)) return;

    // Fetch Subscription Plans
    const plans = await getCollection("Plans");

    // Fetch All Vehicles
    const vehicles = await getCollection("Vehicles");

    // Format Vehicle Data
    vehicles.forEach((vehicle) => {
      vehicle.bookings = null;
      vehicle.license = null;
      vehicle.vin = null;
    });

    // Add Vehicles to Plan
    const vehicleHash = {};
    vehicles.forEach((vehicle) => {
      const hash = `${vehicle.make}${vehicle.model}${vehicle.year}${vehicle.trim}`;
      if (vehicleHash[hash]) return;
      if (!vehicleHash[hash]) vehicleHash[hash] = true;
      const planId = Number(vehicle.plan.id);
      if (plans[planId].vehicles) plans[planId].vehicles.push(vehicle);
      else plans[planId].vehicles = [vehicle];
    });

    // Log Success
    logSuccess("fetch_subscription_plans", "Successfully fetched subscription plans");

    // Return
    response.status(200).json(plans);

    // Handle Error
  } catch (err) {
    logError("fetch_subscription_plans", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_subscription_plans;
