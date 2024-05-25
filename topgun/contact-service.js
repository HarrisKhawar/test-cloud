const { logRequest } = require("../util/logs/log-incoming-request");
const {
  handleOptionsRequest,
} = require("../util/request-handling/handle-options-request");
const { sendMessage } = require("../util/twilio/send-message");

/* ==========================================================================
 * TOPGUN: CONTACT SERVICE
/* ==========================================================================

* Request Headers: 
    
* Request Body:
    - name: <string>
    - email: <string>
    - phone: <string>
    - vehicle: <string>
    - message: <string>
/* ========================================================================== */
const contactService = async (request, response) => {
  try {
    logRequest(request);

    response.set("Access-Control-Allow-Origin", "*");
    if (request.method === "OPTIONS") {
      handleOptionsRequest(response);
      return;
    }

    const { name, email, phone, vehicle, message } = request.body;
    if ((!name, !phone)) throw new Error("Missing required fields.");

    const text = `TOPGUN Website Form:\nName: ${name}\nEmail: ${
      email || "n/a"
    }\nPhone: ${phone}\nVehicle: ${vehicle || "n/a"}\nMessage: ${
      message || "n/a"
    }`;

    await sendMessage(text, "+14132108346");
    await sendMessage(text, "+17812491155");
    await sendMessage(text, "+15124680052");

    response.status(200).json({ message: "Message Sent." });
  } catch (err) {
    console.log(err);
    response.status(500).send("Error sending message: " + err.message);
  }
};

module.exports =  contactService;
