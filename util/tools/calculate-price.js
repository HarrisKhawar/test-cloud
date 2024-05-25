const { getDocument } = require("../firestore/get-document");
const { differenceInDays } = require("date-fns");
const { calculateBookingFee } = require("./calculate-booking-fee");
const { calculateTaxes } = require("./calculate-taxes");
const { calculateDeliveryFee } = require("./calculate-delivery-fee");
const { documentExists } = require("../firestore/document-exists");

const calculatePrice = async (
  start_date,
  end_date,
  rates,
  pickup,
  dropoff,
  promo
) => {
  let price = {
    days: 0,
    rate: rates.daily,
    booking: 0,
    discount: 0,
    booking_discounted: 0,
    delivery: 0,
    taxes: 0,
    taxes_discounted: 0,
    total: 0,
    total_discounted: 0,
  };

  // Calculate Days
  price.days = differenceInDays(end_date, start_date);
  
  // Set to minimum one day
  if (price.days === 0) price.days = 1;

  // Calculate Booking Fee
  price.booking = (price.days * Number(rates.daily)).toFixed(2);
  price.booking_discounted = Number(
    calculateBookingFee(price.days, rates.daily, rates.monthly)
  ).toFixed(2);

  // Calculate Discount
  price.discount = Number(price.booking - price.booking_discounted).toFixed(2);

  // Check Promo Code
  if (promo) {
    // Check Promo Code Exists
    if (!await documentExists("Promos", promo)) throw new Error("Invalid Promo Code");

    // Get Promo Code
    const promoDoc = await getDocument("Promos", promo);

    // Check Promo Code Used
    if (promoDoc.used) throw new Error("Promo Code Already Used");

    // Check Promo Code Eligible
    if (price.booking_discounted < promoDoc.discount)
      throw new Error("Promo Code Invalid for this booking.");

    // Apply Promo Code
    price.discount += promoDoc.discount;
  }

  // Calcuate Taxes
  price.taxes = Number(calculateTaxes(price.booking)).toFixed(2);
  price.taxes_discounted = Number(calculateTaxes(price.booking_discounted)).toFixed(2);

  // Calculate Delivery Fee
  price.delivery = Number(calculateDeliveryFee(pickup, dropoff)).toFixed(2);

  // Calculate Total
  price.total = Number(
    Number(price.booking) + Number(price.taxes) + Number(price.delivery)
  ).toFixed(2);

  // Calculate Total Discounted
  price.total_discounted = Number(
    Number(price.booking_discounted) + Number(price.taxes_discounted) + Number(price.delivery)
  ).toFixed(2);

  // Return Price
  return price;
};

module.exports = { calculatePrice };
