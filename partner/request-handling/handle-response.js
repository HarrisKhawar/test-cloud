const { getDocument } = require("../../util/firestore/get-document");
const { logSuccess, logError } = require("../../util/logs/logging");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");

const handleResponse = async (request, origin, message) => {
  return new Promise(async (resolve, reject) => {
    const user = await getDocument("Customers", request.headers.userid);

    // Send Slack Notification
    await sendSlackNotification(
      `${user.firstName} ${user.lastName}: ${message}`
    );

    // Log Success
    logSuccess(origin, message);
  });
};

module.exports = { handleResponse };
