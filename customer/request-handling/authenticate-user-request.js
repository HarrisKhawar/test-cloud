const admin = require("firebase-admin");

const authenticateUserRequest = async (authToken, idToken, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!idToken || !userId || !authToken) {
        reject({
          message: "Invalid Request: Missing Auth Token, ID Token or User ID.",
        });
        return;
      }

      // Verify access token
      if (authToken !== process.env.APP_AUTH_TOKEN) {
        reject({ message: "Unauthorized Request: Incorrect Auth Token." });
        return;
      }

      // Get decoded token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Confirm decoded token matches user ID
      if (decodedToken.uid !== userId) {
        reject({
          message:
            "Unable to authenticate user: Incorrect or Expired ID Token.",
        });
        return;
      }

      // Resolve
      resolve(true);
    } catch (error) {
      reject({ message: "Unable to verify user. Contact Support." });
      return;
    }
  });
};

module.exports = { authenticateUserRequest };
