const axios = require("axios");


const reverseGeocoding = (lat, lng) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}&api_key=65d6f7dbd4dd7246920295brn41e9ea`;
      const response = await axios.get(url);
      const address = response.data?.address;
      const formattedAddress = `${address.house_number || ""} ${address.road || ""}, ${
        address.city || address.town | ""
      }, ${address["ISO3166-2-lvl4"].split("-")[1]}`;
      resolve(formattedAddress);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { reverseGeocoding };
