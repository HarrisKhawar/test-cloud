const { differenceInDays } = require("date-fns");

const calculateBookingFee = (
  total_days,
  daily_rate,
  monthly_rate
) => {
  // Calculate Total Days
  let days = total_days;

  // Calculate Months
  const months = Math.floor(days / 30);
  days = days - months * 30;

  // Calculate Weeks
  const weeks = Math.floor(days / 7);
  days = days - weeks * 7;

  // Calculate Three Days
  const three_days = Math.floor(days / 3);
  days = days - three_days * 3;

  // Calculate Booking Fee
  let booking_fee = 0;
  if (months > 0) booking_fee += months * Number(monthly_rate);
  if (weeks > 0) booking_fee += weeks * Number(daily_rate) * 7 * 0.6;
  if (three_days > 0) booking_fee += three_days * Number(daily_rate) * 3 * 0.8;
  if (days > 0) booking_fee += days * Number(daily_rate);

  // Return Booking Fee
  return booking_fee.toFixed(2);
};

module.exports = { calculateBookingFee };
