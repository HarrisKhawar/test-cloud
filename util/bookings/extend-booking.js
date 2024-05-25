const { updateDocument } = require("../firestore/update-document");
const {getDocument} = require("../firestore/get-document");
const { logError } = require("../logs/logging");
const FieldValue = require("firebase-admin").firestore.FieldValue;

const extendBooking = (booking, extension, payment) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!booking || !extension)
        reject({
          message: "Invalid Request: Missing Required Fields for Booking",
        });

      // Update Vehicle
      const vehicleBooking = {
        start_date: booking.start_date,
        end_date: extension.end_date,
        id: booking.id,
        customerId: booking.customer.id,
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
      };
      await updateDocument("Vehicles", booking.vehicle.id, {
        bookings: FieldValue.arrayUnion(vehicleBooking),
      });
      const originalVehicleBooking = {
        start_date: booking.start_date,
        end_date: booking.end_date,
        id: booking.id,
        customerId: booking.customer.id,
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
      };
      await updateDocument("Vehicles", booking.vehicle.id, {
        bookings: FieldValue.arrayRemove(originalVehicleBooking),
      });

      // Update Customer
      const vehicle = await getDocument("Vehicles", booking.vehicle.id);
      await updateDocument("Customers", booking.customer.id, {
        booking: {
          id: booking.id,
          start_date: booking.start_date,
          end_date: extension.end_date,
          vehicleId: booking.vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          license: vehicle.license,
          image: vehicle.images.corner,
        }
      });

      // Update Booking
      await updateDocument("Bookings", booking.id, {
        ...booking,
        extension: FieldValue.arrayUnion({
          ...extension,
          original: {
            start_date: booking.start_date,
            end_date: booking.end_date,
            miles_included: booking.miles_included,
            mileage_rate: booking.mileage_rate,
            drop_off_location: booking.drop_off_location,
            price: booking.price,
            payment: booking.payment,
          },
        }),
        end_date: extension.end_date,
        miles_included: (Number(extension.miles_included) + Number(booking.miles_included)).toString(),
        mileage_rate: extension.mileage_rate,
        drop_off_location: extension.drop_off_location,
        price: {
          ...booking.price,
          booking: (Number(Number(booking.price.booking) + Number(extension.booking_fee))).toFixed(2).toString(),
          taxes: (Number(Number(booking.price.taxes) + Number(extension.taxes))).toFixed(2).toString(),
          total: (Number(Number(booking.price.total) + Number(extension.total))).toFixed(2).toString(),
        },
        payment: {
          id: payment.id,
          status: payment.status,
        },
        status: "active",
      });

      resolve();
    } catch (err) {
      reject(err);
      logError("extend_booking:", err.message);
    }
  });
};

module.exports = { extendBooking };
