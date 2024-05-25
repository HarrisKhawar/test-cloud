const axios = require("axios");

/* ============================================
 This method fetches a driver in
 the Samsara account.
 ============================================ */

const fetchDriver = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://api.samsara.com/fleet/drivers/${data.samsaraId}`,
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

module.exports = fetchDriver;
