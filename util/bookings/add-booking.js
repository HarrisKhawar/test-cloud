const FieldValue = require("firebase-admin").firestore.FieldValue;
const { addDocument } = require("../firestore/add-document");
const {
  setSubcollectionDocument,
} = require("../firestore/set-subcollection-document");
const { updateDocument } = require("../firestore/update-document");

/**
 * * This method adds a booking to the database and updates the vehicle and user
 * @param booking <object> complete booking object
 */

const addBooking = (booking) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm required fields
      if (!booking) {
        reject({
          message: "Invalid Request: Missing Required Fields for Booking",
        });
      }

      // Add Booking to Firebase
      const bookingId = await addDocument("Bookings", booking);

      // Create Booking Object for Vehicle
      const vehicleBooking = {
        start_date: booking.start_date,
        end_date: booking.end_date,
        id: bookingId,
        customerId: booking.customer.id,
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName,
      };

      // Create Booking Object for User
      const customerBooking = {
        id: bookingId,
        vehicleId: booking.vehicle.id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
        license: booking.vehicle.license,
        image: booking.vehicle.image,
      };

      // If booking is not completed or cancelled, add to vehicle and user
      if (booking.status !== "completed" && booking.status !== "cancelled") {
        // Add Booking to Vehicle
        await updateDocument("Vehicles", booking.vehicle.id, {
          bookings: FieldValue.arrayUnion(vehicleBooking),
        });

        // Add Booking to User
        await updateDocument("Customers", booking.customer.id, {
          booking: customerBooking,
        });
      } else {
        // Add Past Booking to User
        await setSubcollectionDocument(
          "Customers",
          booking.customer.id,
          "Bookings",
          bookingId,
          customerBooking
        );

        // Add Past Booking to Vehicle
        await setSubcollectionDocument(
          "Vehicles",
          booking.vehicle.id,
          "Bookings",
          bookingId,
          vehicleBooking
        );
      }

      // Return Booking ID
      resolve(bookingId);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { addBooking };
//Sample
