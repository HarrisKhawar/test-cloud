const admin = require("firebase-admin");
const { logError } = require("../../util/logs/logging");
const { adminIds } = require("../auth/admin-ids");

const authenticateAdminRequest = async (authToken, idToken, adminId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Confirm Required Fields
      if (!idToken || !adminId || !authToken) {
        reject({
          message: "Invalid Request: Missing Auth Token, ID Token or Admin ID.",
        });
        return;
      }

      // Verify access token
      if (authToken !== process.env.ADMIN_AUTH_TOKEN) {
        reject({ message: "Unauthorized Request: Incorrect Auth Token." });
        return;
      }

      // Check if admin ID is valid
      if (!adminIds.includes(adminId)) {
        reject({ message: "Unauthorized Request: Invalid Admin ID." });
        return;
      }

      // Get decoded token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Confirm decoded token matches admin ID
      if (decodedToken.uid !== adminId) {
        reject({
          message:
            "Unable to authenticate user: Incorrect or Expired ID Token.",
        });
        return;
      }

      // Resolve
      resolve(true);
    } catch (error) {
      logError("Error Authenticating Admin Request: ", error.message);
      reject({ message: "Unable to verify admin. Contact Support." });
      return;
    }
  });
};

module.exports = { authenticateAdminRequest };
