const { handleRequest } = require("../admin/request-handling/handle-request");
const { logSuccess, logError } = require("../util/logs/logging");
const { getDocument } = require("../util/firestore/get-document");
const getStatistics = require("../../util/samsara/vehicles/get-statistics");
const getLocations = require("../../util/samsara/vehicles/get-locations");
const fetchAllAssets = require("../../util/samsara/vehicles/fetch-all-assets");
/* ==========================================================================
* ADMIN: ADD SAMSARA ASSET
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - id: <string>
    - serial: <string>
/* ========================================================================== */
const add_samsara_asset = async (request, response) => {
  try {
    // Handle Request
    // if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    // const { id } = request.body;
    // if (!id) throw new Error("Missing Vehicle ID.");

    // Fetch Vehicle
    // const vehicle = await getDocument("Vehicles", id);
    const assets = await fetchAllAssets();
    console.log(assets);
    

    // // Send Response
    response.status(200).json({message: "Hello"});

    // Handle Error
  } catch (err) {
    logError("add_samsara_asset", err.message);
    response.status(500).send("Error Adding Samsara Asset: " + err.message);
  }
};

module.exports = add_samsara_asset;
