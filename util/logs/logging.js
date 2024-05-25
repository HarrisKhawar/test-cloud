/**  ---------------------------------- Console Logging ---------------------------------- *
* @param origin <string> Function or Module Name
* @param message <string> Error Message
* @param data <object> Optional Data
//  -------------------------------------------------------------------------------------------- */
const logSuccess = (origin, message, data) => {
  const LOCAL = process.env.ENVIRONMENT === "LOCAL";
  console.log((LOCAL ? "\u001b[1;32m" : "") + origin + ":");
  console.log((LOCAL ? "\u001b[0m" : "") + message);
  if (data) {
    console.log((LOCAL && "\u001b[0m"), data);
  }
};

const logError = (origin, message, data) => {
  const LOCAL = process.env.ENVIRONMENT === "LOCAL";
  console.log((LOCAL ? "\u001b[1;31m" : "") + origin + ":");
  console.log((LOCAL ? "\u001b[0m" : "") + message);
  if (data) {
    console.log((LOCAL && "\u001b[0m"), data);
  }
};

const logInfo = (origin, message) => {
  const LOCAL = process.env.ENVIRONMENT === "LOCAL";
  console.log((LOCAL ? "\u001b[1;33m" : "") + origin);
  console.log((LOCAL ? "\u001b[0m" : "") + message);
};

module.exports = { logSuccess, logError, logInfo };
