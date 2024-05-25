const { getDocument } = require("../firestore/get-document");
const axios = require("axios");

const checkScreeningStatus = async (token, customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const customer = await getDocument("Customers", customerId);
      const digisureId = customer.screening?.id;
      if (!digisureId) throw new Error("Customer has not been screened.");
      const url = `${process.env.DIGISURE_API_URL}/v1/drivers/${digisureId}`;
      const response = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        url: url,
      });
      const data = response.data;
      resolve({
        approval_status: data.approval_status,
        decision_date: data.decision_date,
        decline_reasons: data.decline_reasons,
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = checkScreeningStatus;
