const axios = require("axios");

/** ============================================
 This method fetches all vehicle assets from
 the Samsara account.
 ============================================ */

const fetchAllAssets = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://api.samsara.com/assets",
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

module.exports = fetchAllAssets;
