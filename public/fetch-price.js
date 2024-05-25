const { handlePublicRequest } = require("./handle-public-request");
const { logError } = require("../util/logs/logging");
const { constructDateObject } = require("../util/tools/construct-date-object");
const {
  checkVehicleAvailability,
} = require("../util/vehicles/check-vehicle-availability");
const { getVehicle } = require("../models/get-vehicle");
const { getDocument } = require("../util/firestore/get-document");
const { calculatePrice } = require("../util/tools/calculate-price");

// ! This Endpoint is only used in the POSH WEBSITE
/* ==========================================================================
* FETCH Price for booking
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>

* Request Body:
    - vehicleId <string>
    - start_date: <string>
    - start_time: <string>
    - end_date: <string>
    - end_time: <string>
    - pick_up_address: <string>
    - drop_off_address: <string>
    - promo: <String>
/* ========================================================================== */
const fetch_price = async (request, response) => {
  try {
    if (handlePublicRequest(request, response)) return;

    // Confirm Required Fields
    const { vehicleId, start_date, start_time, end_date, end_time, promo } =
      request.body;
    const { pick_up_address, drop_off_address } = request.body;
    if (!vehicleId || !start_date || !start_time || !end_date || !end_time) {
      throw new Error("Missing required fields.");
    }

    // Fetch Vehicle
    const vehicle = getVehicle(await getDocument("Vehicles", vehicleId));

    // Construct Date Objects
    const startDate = constructDateObject(start_date, start_time);
    const endDate = constructDateObject(end_date, end_time);

    // Verify Dates
    if (startDate >= endDate) {
      throw new Error("Start date must be before end date.");
    }

    // Calculate Price
    const price = await calculatePrice(
      startDate,
      endDate,
      vehicle.rates,
      pick_up_address,
      drop_off_address,
      promo
    );

    // Send Response
    response.status(200).json(price);
    console.log(price);
  } catch (err) {
    logError("fetch_price", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_price;
