const FieldValue = require("firebase-admin").firestore.FieldValue;
const { getDocument } = require("../firestore/get-document");
const { updateDocument } = require("../firestore/update-document");
const {
  setSubcollectionDocument,
} = require("../firestore/set-subcollection-document");

const completeBooking = (bookingId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!bookingId) reject({ message: "Booking ID is required" });

      // Get Booking
      const booking = await getDocument("Bookings", bookingId);

      // Get Customer
      const customer = await getDocument("Customers", booking.customer.id);

      // Get Vehicle
      const vehicle = await getDocument("Vehicles", booking.vehicle.id);

      if (!customer.booking)
        throw new Error("Customer does not have an active booking.");
      if (booking.status !== "active")
        throw new Error(
          "Booking has not started yet. Cancel instead of complete."
        );

      // Update Booking Status
      await updateDocument("Bookings", bookingId, {
        status: "completed",
      });

      // Add Past Booking to User
      await setSubcollectionDocument(
        "Customers",
        booking.customer.id,
        "Bookings",
        bookingId,
        customer.booking
      );

      // Delete Booking from Customer
      await updateDocument("Customers", booking.customer.id, {
        booking: FieldValue.delete(),
      });

      // Get Vehicle Booking Record
      const bookingRecord = vehicle.bookings?.find(
        (booking) => booking.id === bookingId
      );

      // Add Past Booking to Vehicle
      await setSubcollectionDocument(
        "Vehicles",
        booking.vehicle.id,
        "Bookings",
        bookingId,
        bookingRecord
      );

      // Delete Booking from Vehicle
      await updateDocument("Vehicles", booking.vehicle.id, {
        bookings: FieldValue.arrayRemove(bookingRecord),
      });

      // Send Response
      resolve(bookingId);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { completeBooking };
