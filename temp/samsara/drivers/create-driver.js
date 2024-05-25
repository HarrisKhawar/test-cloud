const axios = require("axios");

/* ============================================
 This method creates a new driver in
 the Samsara account.

 * Request Body:
    "name": "<string>",
    "password": "<string>",
    "username": "<string>",
    "licenseNumber": "<string>",
    "licenseState": "<string>",
    "locale": "be",
    "phone": "<string>",
 ============================================ */

const createDriver = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://api.samsara.com/fleet/drivers",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.SAMSARA_API_TOKEN}`,
        },
        data: JSON.stringify(data),
      };

      const response = await axios(config);
      resolve(response.data);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = createDriver;
