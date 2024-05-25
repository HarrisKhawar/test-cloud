const { pushExpoNotification } = require("../util/expo/push-notification");
const { documentExists } = require("../util/firestore/document-exists");
const { updateDocument } = require("../util/firestore/update-document");
const { logError, logSuccess } = require("../util/logs/logging");
const { WebClient } = require("@slack/web-api");
const FieldValue = require("firebase-admin").firestore.FieldValue;

/* ==========================================================================
 * WEBHOOK: SLACK REPLYS
/* ========================================================================== */

const support_reply = async (request, response) => {
  try {
    // Solve Challenge
    if (request.body?.type === "url_verification") {
      const challenge = request.body?.challenge;
      if (challenge) {
        response.status(200).send(challenge);
        return;
      }
    }
    const token = process.env.SLACK_BOT_TOKEN;
    const slack = new WebClient(token);

    // Get Event Body
    const body = request.body;
    const event = body.event;

    // Get Message text
    const reply = event.text;

    // Check if message is a reply
    if (!event.thread_ts) {
      logError("support_reply", "Message is not a reply.");
      response.status(200).send("Message is not a reply.");
      return;
    }

    // Check if message is not a reply to a support message
    if (event.parent_user_id != process.env.SLACK_BOT_ID) {
      logError("support_reply", "Message is not a reply to a support message.");
      response.status(200).send("Message is not a reply to a support message.");
      return;
    }

    // Get Parent Message
    const parentMessageId = event.thread_ts;
    const channelId = event.channel;

    if (!parentMessageId || !channelId) {
      logError("support_reply", "Missing parent message or channel.");
      response.status(400).send("Missing parent message or channel.");
      return;
    }

    // Get UserId from Parent Message
    let userId;

    // Call the conversations.history method using the built-in WebClient
    const result = await slack.conversations.history({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      // In a more realistic app, you may store ts data in a db
      latest: parentMessageId,
      // Limit results
      inclusive: true,
      limit: 1,
    });

    // There should only be one result (stored in the zeroth index)
    message = result.messages[0].text;
    userId = message.slice(message.indexOf("#") + 1, message.lastIndexOf("]"));

    if (!userId) {
      logError("support_reply", "Missing chat ID.");
      response.status(400).send("Missing chat ID.");
      return;
    }

    // Check if char exists
    if (!(await documentExists("Messages", userId))) {
      throw new Error("Customer needs to begin chat.");
    }

    // Create Message Entry
    const entry = {
      message: reply,
      time: Date.now(),
      user: false,
    };

    // Add Message Entry
    await updateDocument("Messages", userId, {
      messages: FieldValue.arrayUnion(entry),
    });

    // Send Push Notification
    if (await documentExists("Customers", userId))
      await pushExpoNotification(userId, "Support Message", reply);

    // Send Response
    response.status(200).send("Message sent");
    // Log Message
    logSuccess("support_reply", "Message sent - " + userId + ": " + reply);
  } catch (err) {
    logError("support_reply", err.message);
    response.status(400).send(`Error Sending Support Reply: ${err.message}`);
  }
};

module.exports = support_reply;
