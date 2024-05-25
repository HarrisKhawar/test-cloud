const logRequest = (request) => {
  try {
    console.log("Incoming Request:", {
      method: request.method,
      // url: request.url,
      user: request.headers.userid || request.headers.adminid,
      body: request.body,
    });
  } catch (err) {
    throw new Error("Error logging request:" + err.message);
  }
};

module.exports = { logRequest };
