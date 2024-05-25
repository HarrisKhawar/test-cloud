const smartcar = require("smartcar");
const { getDocument } = require("../firestore/get-document");
const { setDocument } = require("../firestore/set-document");

const getAccessToken = () => {
  return new Promise(async (resolve, reject) => {
    // Get Access Token
    let access = await getDocument("Access", "smartcar");

    // Check access token is not expired
    if (access.expires_at.toDate() < Date.now()) {
      const client = new smartcar.AuthClient({
        clientId: process.env.SMARTCAR_CLIENT_ID,
        clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
        redirectUri: process.env.HOST + "/webhooks/smartcar_exchange",
      });

      // Refresh access token
      const newAccess = await client.exchangeRefreshToken(access.refresh_token);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 2);
      await setDocument("Access", "smartcar", {
        access_token: newAccess.accessToken,
        refresh_token: newAccess.refreshToken,
        expires_at: expiryDate,
      });

      // Get new access token
      access = await getDocument("Access", "smartcar");
    }

    // Return Access Token
    resolve(access.access_token);
  });
};

module.exports = { getAccessToken };
