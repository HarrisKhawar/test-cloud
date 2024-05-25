const axios = require("axios");

/* ============================================
 This method deletes a vehicle driver
 assignment in the Samsara account.

 * Request Body:
    "vehicleId": "<string>",
    "assignedAtTime": "<string>",
    "endTime": "<string>",
    "isPassenger": "<boolean>",
    "startTime": "<string>"

 ============================================ */

const deleteAssignmnent = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let config = {
        method: "delete",
        maxBodyLength: Infinity,
        url: "https://api.samsara.com/fleet/driver-vehicle-assignments",
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

module.exports = deleteAssignmnent;
