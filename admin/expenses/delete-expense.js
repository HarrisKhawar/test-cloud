const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { deleteDocument } = require("../../util/firestore/delete-document");


/* ==========================================================================
* ADMIN: DELETE EXPENSE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - expenseId: <string>
    
/* ========================================================================== */
const delete_expense = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { expenseId } = request.body;
    if (!expenseId) throw new Error("Missing Expense ID.");

    // Delete Expense
    await deleteDocument("Expenses", expenseId);

    // Send Response
    response.status(200).json({ expenseId });

    // Handle Error
  } catch (err) {
    logError("admin_delete_expense:", err.message);
    response.status(500).send("Error deleting expense.");
  }
};

module.exports = delete_expense;
