/**
// ! ---------------------------------- Calculate Extension Price ---------------------------------- *
* @param booking <object> { start_date: <javascript date>, end_date: <javascript date> }
* @param vehicle <object> { rates.monthly: <number>, rates.daily: <number> }
// TODO: Add Taxes
*/

const differenceInDays = require("date-fns/differenceInDays");

const calculateExtensionPrice = (booking, endDate, vehicle) => {
    // Get Rates
    const dailyRate = parseInt(vehicle.rates.daily);
  
    // Get Dates
    const startDate = booking.end_date.toDate();
  
    // Set Totals
    let bookingTotal = 0;
    let taxes = 0;
    let total = 0;
  
    // Calculate Number of Days
    let totalDays = differenceInDays(endDate, startDate);
  
    // Calculate Price
    bookingTotal = totalDays * dailyRate;
    total += bookingTotal;
  
    return {
      total: total.toString(),
      bookingTotal: bookingTotal.toString(),
      taxes: taxes.toString(),
      totalDays: totalDays.toString(),
      dailyRate: dailyRate.toString(),
    };
  };

module.exports = { calculateExtensionPrice };