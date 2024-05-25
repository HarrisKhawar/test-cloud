const axios = require("axios");

/* ============================================
 This method fetches a vehicle's location from
 the Samsara account.

 * Request Data:
    [vehicleId <string>, vehicleId <string>]
 ============================================ */

const getStatistics = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const vehicleIds = data.join(",");
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.samsara.com//fleet/vehicles/stats?vehicleIds=${vehicleIds}&types=obdOdometerMeters,fuelPercents,gpsDistanceMeters`,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.SAMSARA_API_TOKEN}`,
        },
      };

      const response = await axios(config);
      resolve(response.data);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = getStatistics;
