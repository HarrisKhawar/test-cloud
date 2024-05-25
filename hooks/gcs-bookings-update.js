const { updateDocument } = require("../util/firestore/update-document");
const { logError, logSuccess } = require("../util/logs/logging");
const { documentExists } = require("../util/firestore/document-exists");
const {
  sendSlackNotification,
} = require("../util/slack/send-slack-notification");
const { getCollection } = require("../util/firestore/get-collection");
const { sendMessage } = require("../util/twilio/send-message");
/* ==========================================================================
* GCS: BOOKINGS UPDATE
/* ==========================================================================

* Request Headers: 
 - Authorization

* Request Body:

/* ========================================================================== */

const bookings_update = async (request, response) => {
  try {
    const { authorization } = request.headers;
    console.log("Incoming Webhook GCS: Bookings Update");
    if (!authorization || authorization !== "7281HSUHS929OASA")
      throw new Error("Incorrect auth.");

    console.log("Authorized");

    const bookings = await getCollection("Bookings");
    let bookingsEndingToday = [];
    let bookingStartsToday = [];

    bookings.forEach((booking) => {
      const todayDate = new Date();
      const startDate = booking.start_date.toDate();
      const endDate = booking.end_date.toDate();

      if (booking.status !== "active") return;
      // Check if end date is today
      if (
        todayDate.getFullYear() === endDate.getFullYear() &&
        todayDate.getMonth() === endDate.getMonth() &&
        todayDate.getDate() === endDate.getDate()
      ) {
        bookingsEndingToday.push(booking);
      }
    });

    const getMessage = (booking) => {
      return `Dear Customer, your booking for ${booking.vehicle.make} ${booking.vehicle.model} ends today. Please return the vehicle at ${booking.drop_off_location} at or before ${booking.end_date.toDate().getHours()+2}:00. Please make sure that the vehicle is clean. Thank you!\nIf you want to extend, please contact support at +14132108346.`;
    };

    const slackMessage = (bookings) => {
      let message =  `Bookings ending today:\n`;
      bookings.forEach((booking, idx) => {
        message += `${idx+1}. ${booking.customer.firstName} ${booking.customer.lastName} - ${booking.vehicle.model} ${booking.vehicle.license} at ${booking.end_date.toDate().toLocaleString().split(",")[1]}\n`;
      })
      return message;
    };

    // Loop over bookings
    bookingsEndingToday.forEach((booking) => {
      // Send SMS
      sendMessage(booking.customer.phone, getMessage(booking));
    });

    // Send Slack Notification
    sendSlackNotification(slackMessage(bookingsEndingToday));

    response.status(200).send("OK");
  } catch (err) {
    logError("gcs-bookings-update", err.message);
    response.status(400).send(`${err.message}`);
  }
};

module.exports = bookings_update;
