const { updateDocument } = require("../firestore/update-document");

const FieldValue = require("firebase-admin").firestore.FieldValue;

const useCoupon = ({ id, price, customerId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check required fields
      if (!price || !customerId) throw new Error("Missing Required Fields.");

      // Check price object
      if (!price.total) throw new Error("Invalid Price Object.");

      // Mark Coupon as used
      await updateDocument("Coupons", id, {
        used: true,
        usedBy: FieldValue.arrayUnion({
          customer: customerId,
          usedOn: new Date(),
          subtotal: price.subtotal,
          discount: price.discount,
          total: price.total,
        }),
      });

      // Return Price
      resolve(price);
    } catch (err) {
      reject({
        message: `${err.message}`,
      });
    }
  });
};

module.exports = { useCoupon };
