const axios = require("axios");
const { logSuccess } = require("../logs/logging");

/** =========== SEND SLACK NOTIFICATION =========== */
/**
 * @param {String} message
 * @param {String} channel
 /** ====================== */

const sendSlackNotification = async (message, channel) => {
  return new Promise(async (resolve, reject) => {
    try {
      const slackToken = process.env.SLACK_BOT_TOKEN;
      const url = "https://slack.com/api/chat.postMessage";
      message = `[${process.env.ENVIRONMENT}] ${message}`;
      const res = await axios.post(
        url,
        {
          channel: channel || "#notifications",
          text: message,
        },
        {
          headers: {
            authorization: `Bearer ${slackToken}`,
          },
        }
      );
      // Log Success
      logSuccess(
        "sendSlackNotification",
        "Slack Notification Sent: " + message
      );

      // Return Response
      resolve(res);

      // Handle Error
    } catch (err) {
      resolve(false);
      console.log(err);
    }
  });
};

module.exports = { sendSlackNotification };
