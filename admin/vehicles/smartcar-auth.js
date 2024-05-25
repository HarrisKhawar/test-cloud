const smartcar = require("smartcar");
const { handleRequest } = require("../request-handling/handle-request");
const { logError, logSuccess } = require("../../util/logs/logging");
/* ==========================================================================
* ADMIN: SMARTCAR AUTH
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userid: <string>
    
* Request Body:
/* ========================================================================== */
const smartcar_auth = async (request, response) => {
  try {
    if (await handleRequest(request, response)) return;

    const client = new smartcar.AuthClient({
      clientId: process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri: process.env.HOST + "/webhooks/smartcar-exchange",
      mode: process.env.ENVIROMENT === "LOCAL" ? "test" : "live",
    });

    const scopes = [
      "control_security",
      "read_fuel",
      "read_location",
      "read_odometer",
      "read_vehicle_info",
      "read_vin",
    ];

    const link = client.getAuthUrl(scopes);

    logSuccess("smartcar_auth", "Smartcar Auth Link Generated", { link: link });
    response.status(200).json({ link: link });
  } catch (err) {
    logError("smartcar_auth", err);
    response.status(400).send(`Error Generating Link: ${err.message}`);
  }
};

module.exports = smartcar_auth;
