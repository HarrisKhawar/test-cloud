const { getCollection } = require("../util/firestore/get-collection");
const admin = require("firebase-admin");
const { handlePublicRequest } = require("./handle-public-request");
const { updateDocument } = require("../util/firestore/update-document");

/* ==========================================================================
 * PUBLIC: FETCH DATA
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
/* ========================================================================== */
const fetch_data = async (request, response) => {
  try {
    if (handlePublicRequest(request, response)) return;

    // Get Vehicles
    const vehicles = await getCollection("Vehicles");

    // Get Vehicle Images
    let images = [];
    vehicles.forEach((vehicle) => {
      if (vehicle.images?.corner) images.push(vehicle.images.corner);
    });

    // Get Brands
    const brands = await getCollection("Brands");
    
    // Get Locations
    const locations = await getCollection("Locations");

    // Fetch Data
    const data = {
      locations: locations,
      phone: "+14132108346",
      images: images,
      brands: brands,
      version: "1.0.0",
    };

    console.log(data.brands);

    // Send Response
    response.status(200).json(data);

    // Handle Error
  } catch (err) {
    logError("fetch_data", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = fetch_data;
