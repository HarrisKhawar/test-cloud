const axios = require("axios");
const splitAddress = require("../tools/splitAddress");
const { updateDocument } = require("../firestore/update-document");
const addDriver = async (token, customer) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!token) throw new Error("Missing API Access Token.");
      if (!customer.firstName) throw new Error("Missing First Name.");
      if (!customer.lastName) throw new Error("Missing Last Name.");
      if (!customer.dob) throw new Error("Missing Date of Birth.");
      if (!customer.drivers_license_number)
        throw new Error("Missing Drivers License Number.");
      if (!customer.drivers_license_exp)
        throw new Error("Missing Drivers License Expiration Date.");
      if (!customer.email) throw new Error("Missing Email.");
      if (!customer.phone) throw new Error("Missing Phone Number.");
      if (!customer.address) throw new Error("Customer has missing address.");

      // Confirm Customer Address
      let address = {};
      if (
        !customer.street ||
        !customer.street2 ||
        !customer.city ||
        !customer.state ||
        !customer.zip ||
        !customer.country
      ) {
        address = splitAddress(customer.address);
        await updateDocument("Customers", customer.id, {
          street: address.street,
          street2: address.street2,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
        });
      } else {
        address = {
          street: customer.street,
          street2: customer.street2,
          city: customer.city,
          state: customer.state,
          zip: customer.zip,
          country: customer.country,
        };
      }

      // Send Request
      const response = await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        url: `${process.env.DIGISURE_API_URL}/v1/drivers`,
        data: JSON.stringify({
          driver: {
            partner_driver_id: customer.id, //string
            given_names: customer.firstName, //string //required
            family_name: customer.lastName, //string // required
            date_of_birth: formatDate(customer.dob), //string  // required
            driver_license_number: customer.drivers_license_number, //string   //required
            driver_license_expiration_date: formatDate(
              customer.drivers_license_exp
            ), //string //required
            email: customer.email, //string   //required
            phone: customer.phone, //string   //required
            custom_fields: {},
            driver_license_address: {
              street: address.street,
              street2: address.street2,
              city: address.city,
              state: address.state,
              zipcode: address.zip,
              country: address.country,
            },
          },
        }),
      });
      const data = response.data;
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
};

const formatDate = (dob) => {
  // Change MM/DD/YYYY to YYYY-MM-DD
  const split = dob.split("/");
  const year = split[2];
  const month = split[0];
  const day = split[1];
  return `${year}-${month}-${day}`;
};

module.exports = addDriver;
