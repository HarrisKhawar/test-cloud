// Check if date is in the format: mm/dd/yyyy
const checkDateFormat = (date) => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    return dateRegex.test(date);
  };
  
  
  // Check Date Passed
  const checkDatePassed = (date) => {
    if (!checkDateFormat(date)) throw new Error("Invalid Date Format.");
    const today = new Date();
    return new Date(date) < today;
  };
  
  
  module.exports = { checkDateFormat, checkDatePassed }; 