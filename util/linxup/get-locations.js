const axios = require("axios");

/* ============================================
 This method fetches a vehicle's location from
 the Linxup account.
    
 ============================================ */

const getLocations = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://app02.linxup.com/ibis/rest/api/v2/locations`,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.LINXUP_API_TOKEN}`,
        },
      };

      const response = await axios(config);
      resolve(response.data);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = getLocations;
