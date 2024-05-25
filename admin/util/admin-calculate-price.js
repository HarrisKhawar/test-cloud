const { differenceInDays } = require("date-fns");

const calculatePrice = (
  booking_fee,
  delivery_fee,
  taxes,
  startDate,
  endDate
) => {
  try {
    // Calculate Booking Total
    const total = Number(booking_fee) + Number(delivery_fee) + Number(taxes);

    // Calculate Number of Days
    const total_days = differenceInDays(endDate, startDate);

    // Create Price Object
    const price = {
      booking: Number(booking_fee),
      delivery: Number(delivery_fee),
      taxes: Number(taxes),
      total: total,
      total_days: total_days,
    };

    return price;
  } catch (error) {
    throw new Error ("Error calculating price.");
  }
};

module.exports = { calculatePrice };
