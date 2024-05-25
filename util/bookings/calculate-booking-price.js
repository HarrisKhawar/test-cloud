/**
// ! ---------------------------------- Calculate Booking Price ---------------------------------- *
* @param booking <object> { start_date: <javascript date>, end_date: <javascript date> }
* @param vehicle <object> { rates.monthly: <number>, rates.daily: <number> }
// TODO: Add Taxes
*/

const differenceInDays = require("date-fns/differenceInDays");

const calculateBookingPrice = (booking, vehicle) => {
    // Get Rates
    const dailyRate = parseInt(vehicle.rates.daily);
    const monthlyRate = parseInt(vehicle.rates.monthly);
    const deliveryRate = parseInt(process.env.DELIVERY_RATE);
  
    // Set Totals
    let bookingTotal = 0;
    let taxes = 0;
    let deliveryFee = 0;
    let total = 0;
  
    // Calculate Number of Days
    let totalDays = differenceInDays(booking.end_date, booking.start_date);
    // Min Days = 1
    if (totalDays === 0) totalDays = 1;
    // Calculate Number of Months
    const totalMonths = Math.floor(totalDays / 30);
  
    // Calculate Booking Total
    // if months > 0, calculate price for each month + each day
    if (totalMonths > 0) {
      bookingTotal = totalMonths * monthlyRate + (totalDays % 30) * dailyRate;
      // else calculate price for each day
    } else {
      bookingTotal = totalDays * dailyRate;
    }
  
    // Add Booking Total
    total += bookingTotal;
  
    // Check Delivery Fee
    if (booking.delivery) {
      // Add Delivery Fee
      deliveryFee = deliveryRate;
      total += deliveryFee;
    }
  
    // Add Taxes
    total += taxes;
  
    // Return Price
    return {
      total: total.toString(),
      bookingTotal: bookingTotal.toString(),
      deliveryFee: deliveryFee.toString(),
      taxes: taxes.toString(),
      totalDays: totalDays.toString(),
      totalMonths: totalMonths.toString(),
      dailyRate: dailyRate.toString(),
      monthlyRate: monthlyRate.toString(),
    };
  };

module.exports = { calculateBookingPrice };