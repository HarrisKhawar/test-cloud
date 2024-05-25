const { Expo } = require("expo-server-sdk");
const { getDocument } = require("../firestore/get-document");
const { logError, logSuccess } = require("../logs/logging");

/** =========== PUSH EXPO NOTIFICATION =========== */
/**
 * @param {String} message
 * @param {String} token
 /** ====================== */

const pushExpoNotification = async (customerId, type, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const customer = await getDocument("Customers", customerId);
      const tokens = customer.notifications?.tokens;
      if (!tokens || tokens.length === 0) {
        resolve(false);
        return;
      }
      if (!customer.notifications?.push) {
        resolve(false);
        return;
      }
      let expo = new Expo({
        accessToken: process.env.EXPO_ACCESS_TOKEN,
      });

      let messages = [];
      for (let pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
          logError(
            "pushExpoNotification",
            `Push token ${pushToken} is not a valid Expo push token for customer ${customerId}`
          );
          continue;
        }
        messages.push({
          to: pushToken,
          sound: "default",
          title: type || "Notification",
          body: message,
        });
      }

      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      (async () => {
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error(error);
          }
        }
      })();
      resolve(true);
      logSuccess("pushExpoNotification", "Push notification sent successfully.");
    } catch (err) {
      reject(false);
      console.log(err.message);
    }
  });
};

module.exports = { pushExpoNotification };
