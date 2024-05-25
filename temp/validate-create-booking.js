const validateCreateBooking = (request) => {
  if (!request.vehicleId || !request.customerId) {
    throw new Error("Missing Vehicle ID or Customer ID");
  }

  if (request.recurring && !request.frequency) {    
    throw new Error("Missing Frequency for Recurring Charge");
  }

  if (request.charge === "now" && !request.payment_method_id) {
    throw new Error("Missing Payment Method ID");
  }

  if (request.charge === "invoice" && !request.days_until_due) {
    throw new Error("Missing Days Until Due");
  }

  if (request.charge === "none" && !request.status) {
    throw new Error("Missing Booking Status");
  }

  if (!request.start_date || !request.end_date) {
    throw new Error("Missing Start Date or End Date");
  }

  if (!request.start_time || !request.end_time) {
    throw new Error("Missing Start Time or End Time");
  }

  if (!request.pick_up_location || !request.drop_off_location) {
    throw new Error("Missing Pick Up Location or Drop Off Location");
  }

  if (!request.booking_fee || !request.taxes || !request.delivery_fee) {
    throw new Error("Missing Booking Fee, Delivery Fee, or Taxes");
  }

  return true;
};

module.exports = { validateCreateBooking };
