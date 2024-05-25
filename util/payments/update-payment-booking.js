const { getDocument } = require("../firestore/get-document");
const { updateDocument } = require("../firestore/update-document");
const {
  updateSubcollectionDocument,
} = require("../firestore/update-subcollection-document");

const updatePaymentBooking = ({ bookingId, paymentId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get Payment, Booking, and Vehicle Objects
      const payment = await getDocument("Payments", paymentId);
      const booking = await getDocument("Bookings", bookingId);
      const vehicle = await getDocument("Vehicles", booking?.vehicle?.id);

      // Update Payment Object
      payment.booking = {
        id: booking.id,
        start_date: booking.start_date,
        end_date: booking.end_date,
      };
      payment.vehicle = {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        image: vehicle.images?.corner || false,
      };

      // Update Payment and Customer Documents
      await updateDocument("Payments", paymentId, payment);
      await updateSubcollectionDocument(
        "Customers",
        booking.customer.id,
        "Payments",
        paymentId,
        payment
      );

      resolve(payment);
    } catch (error) {
      reject({ message: error.message });
    }
  });
};

module.exports = { updatePaymentBooking };