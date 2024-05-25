const { getDocument } = require("../firestore/get-document");

const applyCoupon = ({ id, price, tax, customerId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get Coupon
      const coupon = await getDocument("Coupons", id);

      // Check required fields
      if (!price || !customerId || typeof tax !== "number")
        throw new Error("Coupon: Missing Required Fields.");

      // Check price object
      if (!price.subtotal) throw new Error("Price object missing subtotal.");

      // Check if coupon is reusable or unused
      if (!coupon.reusable && coupon.used)
        throw new Error("This coupon is no longer valid.");

      // Check coupon restrictions
      if (coupon.for === "customer" && coupon.forId !== customerId)
        throw new Error("This coupon cannot be used by you.");

      // Apply Coupon
      let afterDiscount = 0;
      if (coupon.type === "percentage") {
        // Discount = Subtotal * Coupon
        price.discount = Number(
          Number(price.subtotal) * Number(coupon.amount)
        ).toFixed(2);
        // After Discount = Subtotal - Discount
        afterDiscount = Number(Number(price.subtotal) - Number(price.discount));
      } else if (coupon.type === "fixed") {
        // Discount = Coupon
        price.discount = Number(coupon.amount).toFixed(2);
        // After Discount = Subtotal - Discount
        afterDiscount = Number(Number(price.subtotal) - Number(price.discount));
        if (afterDiscount < 0) throw new Error("Coupon cannot be applied. Discount exceeds total.");
      }

      // Tax = Subtotal * Tax
      price.tax = Number(Number(afterDiscount) * Number(tax)).toFixed(2);
      // Total = Subtotal + Tax
      price.total = Number(Number(afterDiscount) + Number(price.tax)).toFixed(
        2
      );

      // Return Price
      resolve(price);
    } catch (err) {
      reject({
        message: `${err.message}`,
      });
    }
  });
};

module.exports = { applyCoupon };
