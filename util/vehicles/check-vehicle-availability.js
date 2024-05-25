/**
// ! ---------------------------------- Check Vehicle Availability ---------------------------------- *
* @param startDate <javascript date>
* @param endDate <javascript date>
* @param vehicle <object> { 
  status.available: <boolean>, 
  bookings: <array> [
    <object> {start_date: <javascript date>, end_date: <javascript date>}
  ] 
}

* * A window of 2 hours is added to the booking window to ensure that the vehicle is available for the entire booking window
*/

const { format } = require("date-fns");

const checkVehicleAvailability = (startDate, endDate, vehicle) => {
  const window = 2; // booking window (hours)

  try {
    // if vehicle is listed as not available, return false
    if (!vehicle.status.available) return false;

    // if vehicle has bookings,
    if (vehicle.bookings && vehicle.bookings.length > 0) {
      let isAvailable = true;
      
      // check if any of the bookings overlap with the search criteria
      for (const vehicle_booking of vehicle.bookings) {
        const vehicle_booking_start_date = vehicle_booking.start_date.toDate();
        const vehicle_booking_end_date = vehicle_booking.end_date.toDate();
        const booking_start_date = startDate;
        booking_start_date.setHours(booking_start_date.getHours() - window);
        const booking_end_date = endDate;
        booking_end_date.setHours(booking_end_date.getHours() + window);

        // set availability to false if the search criteria overlaps with a booking
        if (
          vehicle_booking_start_date < booking_end_date &&
          vehicle_booking_end_date > booking_start_date
        ) {
          isAvailable = false;
          break;
        } else continue;
      }
      // Return availability
      return isAvailable;

      // If vehicle has no vehicle bookings, return true
    } else {
      return true;
    }
  } catch (err) {
    throw new Error("Unable to check vehicle availability:" + err.message);
  }
};

module.exports = { checkVehicleAvailability };
