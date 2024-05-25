const { logSuccess } = require("../logs/logging");

const constructBooking = (
  customer,
  vehicle,
  startDate,
  endDate,
  pick_up_location,
  drop_off_location,
  price,
  start_mileage,
  start_fuel,
  miles_included,
  mileage_rate
) => {
  try {
    // Create Booking Object
    const booking = {
      date_created: new Date(),
      start_date: startDate,
      end_date: endDate,
      location: vehicle.location,
      pick_up_location: pick_up_location,
      drop_off_location: drop_off_location,
      delivery:
        vehicle.address?.localeCompare(pick_up_location) === 0 ? false : true,
      status: "pending",
      price: price,
      start_mileage: start_mileage || 0,
      start_fuel: start_fuel || 90,
      miles_included: miles_included || Math.floor(150 * Number(price.total_days)),
      mileage_rate: mileage_rate || 0.35,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
      },
      vehicle: {
        id: vehicle.id,
        image: vehicle.images.corner,
        license: vehicle.license,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
      },
      payment: {
        id: false,
        status: "not_charged",
      },
    };

    // Log Success
    logSuccess("constructBookingObject", "Booking Object Created:", booking);

    // Return Booking Object
    return booking;
  } catch (err) {
    throw new Error(`Error in getBookingObject: ${err.message}`);
  }
};

module.exports = { constructBooking };
