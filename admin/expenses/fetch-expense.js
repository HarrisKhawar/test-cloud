const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess, logError } = require("../../util/logs/logging");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
* ADMIN: FETCH EXPENSE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>
    
* Request Body:
    - expenseId: <string>
/* ========================================================================== */
const fetch_expense = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { expenseId } = request.body;
    if (!expenseId) throw new Error("Missing Expense ID.");

    // Fetch expense
    const expense = await getDocument("Expenses", expenseId);

    // Log Success
    logSuccess(
      "admin_fetch_expense",
      "Successfully fetched expense:",
      expenseId
    );

    // Send Response
    response.status(200).json(expense);

    // Handle Error
  } catch (err) {
    logError("admin_fetch_expense:", err.message);
    response.status(500).send("Error fetching expense.");
  }
};

module.exports = fetch_expense;
