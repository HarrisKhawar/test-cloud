const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");
const { addDocument } = require("../../util/firestore/add-document");
const { setDocument } = require("../../util/firestore/set-document");
const { getCollection } = require("../../util/firestore/get-collection");
const { convertTimeFormat } = require("../../util/tools/convert12to24Time");
/* ==========================================================================
* ADMIN: UPLOAD TOLLS
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - tolls: <array>
/* ========================================================================== */
const upload_tolls = 
  async (request, response) => {
    try {
      // Handle Request
      if (await handleRequest(request, response)) return;

      // Confirm Required Fields
      const { tolls } = request.body;
      if (!tolls) throw new Error("No tolls provided.");

      // Get latest toll entry
      const latestToll = await getDocument("Tolls", "latest");
      const latestTollDate = new Date(latestToll["Reported At"]);

      // Get new latest toll
      let newLatestToll = tolls[0];
      let newLatestDate = new Date(newLatestToll["Reported At"]);

      // Tolls Not Added
      let tollsNotAdded = [];

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

      // Check if all tolls are newer than latest toll
      tolls.forEach(async (toll) => {
        try {
          // Format Reported At
          const [dateStr, timeStr] = toll["Reported At"].split(" ");
          toll["Reported At"] = `${dateStr} ${convertTimeFormat(timeStr)}`

          // Format Tolled At
          const [_dateStr, _timeStr] = toll["Tolled At"].split(" ");
          toll["Tolled At"] = `${_dateStr} ${convertTimeFormat(_timeStr)}`

          // Get Reported At Date
          const date = new Date(toll["Reported At"]);

          // Add vehicle to toll
          toll.vehicle = vinToVehicle[toll.VIN];

          // Add toll to database
          if (date >= latestTollDate && toll.vehicle) {
            // Update new latest toll
            if (date > newLatestDate) {
              newLatestToll = toll;
              newLatestDate = date;
            }
            await addDocument("Tolls", toll);
          } else {
            console.log("Toll not added: ", toll);
            tollsNotAdded.push(toll);
          }
        } catch (error) {
          console.log(error);
          throw error;
        }
      });

      // Update latest toll
      await setDocument("Tolls", "latest", newLatestToll);

      // Send Response
      response.status(200).json(tollsNotAdded);

      // Handle Error
    } catch (err) {
      logError("admin_upload_tolls", err.message);
      response.status(500).send(err.message);
    }
  }


  module.exports = upload_tolls;
