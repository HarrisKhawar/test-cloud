const { handleRequest } = require("../request-handling/handle-request");
const { logError, logSuccess } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { setDocument } = require("../../util/firestore/set-document");
const { getCollection } = require("../../util/firestore/get-collection");
/* ==========================================================================
* ADMIN: UPLOAD CHARGING
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - charging: <array>
/* ========================================================================== */
const charging = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { charging } = request.body;
    if (!charging) throw new Error("No charging entries provided.");

    // Get Latest Charge
    let latest = await getDocument("Charging", "latest");
    let latestDate = new Date(latest["ChargeStartDateTime"]);

    // Get Vehicles
    const vehicles = await getCollection("Vehicles");

    // Create VIN to Vehicle Map
    const vinToVehicle = {};
    vehicles.forEach((vehicle) => {
      vinToVehicle[vehicle.vin] = {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        license: vehicle.license,
        vin: vehicle.vin,
        id: vehicle.id,
      };
    });

    // Charges Not Added
    let chargesNotAdded = [];

    // Sort Charging by Date
    charging.sort((a, b) => {
      return (
        new Date(a["ChargeStartDateTime"]) - new Date(b["ChargeStartDateTime"])
      );
    });

    // Loop over charges
    charging.forEach(async (charge) => {
      // Get Charge Date
      const date = new Date(charge["ChargeStartDateTime"]);

      // Check if date is after latest date
      if (date >= latestDate) {
        // Add Vehicle Data to Charge
        const vehicle = vinToVehicle[charge["Vin"]];
        charge["vehicle"] = vehicle;

        // Update Latest Date
        latest = charge;
        latestDate = date;

        // Add Charge to Database
        if (charge["Description"].includes("PARKING")) {
          try {
            await setDocument(
              "Charging",
              `${charge["InvoiceNumber"]}P`,
              charge
            );
          } catch (err) {
            chargesNotAdded.push(charge);
            console.log(err);
          }
        } else {
          try {
            await setDocument("Charging", charge["InvoiceNumber"], charge);
          } catch (err) {
            chargesNotAdded.push(charge);
            console.log(err);
          }
        }
      } else {
        // Add Charge to Charges Not Added
        chargesNotAdded.push(charge);
      }
    });
    console.log("done");

    // Update latest toll
    await setDocument("Charging", "latest", latest);

    // Send Response
    logSuccess("Upload Charging", "Charging uploaded successfully.");
    response.status(200).json(chargesNotAdded);

    // Handle Error
  } catch (err) {
    logError("admin_upload_charging", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = charging;
