const axios = require("axios");

const getAccessToken = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: "POST",
        url: `${process.env.DIGISURE_API_URL}/login`,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          api_key: process.env.DIGISURE_API_KEY,
        }),
      });
      const token = response.data.token;
      resolve(token);
    } catch (err) {
      reject(err);
    }
  });
};


module.exports = getAccessToken;