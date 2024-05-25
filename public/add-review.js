const { addDocument } = require("../util/firestore/add-document");
const { sendSlackNotification } = require("../util/slack/send-slack-notification");
const { logError } = require("../util/logs/logging");
const { getDocument } = require("../util/firestore/get-document");


/* ==========================================================================
 * PUBLIC: ADD REVIEW
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - customerId (optional): <string>
    - name: <string>
    - email: <string>
    - rating: <number>
    - review: <string>
/* ========================================================================== */
const send_message = async (request, response) => {
  try {
    const { customerId, name, email, rating, review } = request.body;

    // Get Data
    const payload = {
      name,
      email,
      rating,
      review,
    };

    // Get Customer
    if (customerId) {
      const customer = await getDocument("Customers", customerId);
      if (customer.booking) {
        payload.booking = customer.booking;
      }
    }

    // Add Review
    const reviewId = await addDocument("Reviews", payload);

    // Send Slack Notification
    await sendSlackNotification(
      `${name} left a review: "${review}" \n(${reviewId})`,
      "#notifications"
    )

    // Send Response
    response.status(200).json({ id: reviewId });

    // Handle Error
  } catch (err) {
    logError("send_message:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = send_message;
