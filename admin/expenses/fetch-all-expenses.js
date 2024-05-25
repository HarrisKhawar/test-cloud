const { handleRequest } = require("../request-handling/handle-request");
const { getCollection } = require("../../util/firestore/get-collection");
const { logSuccess, logError } = require("../../util/logs/logging");

/* ==========================================================================
* ADMIN: FETCH ALL EXPENSES
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
/* ========================================================================== */
const fetch_all_expenses = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Fetch All Expense
    const expenses = await getCollection("Expenses");

    // Send Response
    response.status(200).json(expenses);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_all_expenses:", err.message);
    response.status(500).send("Error fetching Expenses.");
  }
};

module.exports = fetch_all_expenses;
