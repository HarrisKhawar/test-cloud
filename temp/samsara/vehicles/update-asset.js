const axios = require("axios");

/* ============================================
 This method updates a vehicle asset in
 the Samsara account.

 * Request Body:
    "make": "<string>",
    "model": "<string>",
    "name": "<string>",
    "serialNumber": "<string>",
    "type": "uncategorized",
    "vin": "<string>",
    "year": "<long>"
 ============================================ */

const updateAsset = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let config = {
        method: "patch",
        maxBodyLength: Infinity,
        url: `https://api.samsara.com/assets?id=${data.samsaraId}`,
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

module.exports = updateAsset;
