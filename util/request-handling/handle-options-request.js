const { logInfo } = require("../logs/logging");

const handleOptionsRequest = (response) => {
  try {
    logInfo("Handling OPTIONS Request from Browser");
    response.set("Access-Control-Allow-Methods", "POST");
    response.set("Access-Control-Allow-Headers", "*");
    response.status(204).send("");
  } catch (err) {
    throw new Error("Error Handling Options Request: " + err.message);
  }
};

module.exports = { handleOptionsRequest };
