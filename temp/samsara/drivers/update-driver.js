const axios = require("axios");

/* ============================================
 This method updates a driver in
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

const updateDriver = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `https://api.samsara.com/fleet/drivers?id=${data.samsaraId}`,
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

module.exports = updateDriver;
