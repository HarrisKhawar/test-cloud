const { updateDocument } = require("../firestore/update-document");

const startBooking = (bookingId, images) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!bookingId) reject({ message: "Booking ID is required" });

      // Add Images to Booking
      await updateDocument("Bookings", bookingId, {
        check_in_images: images || [],
        status: "active",
      });

      // Send Response
      resolve(bookingId);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { startBooking };
