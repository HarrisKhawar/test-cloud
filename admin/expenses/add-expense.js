const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const { addDocument } = require("../../util/firestore/add-document");
const { getDocument } = require("../../util/firestore/get-document");
const { constructDateObject } = require("../../util/tools/construct-date-object");

/* ==========================================================================
* ADMIN: ADD EXPENSE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  adminid: <string>

* Request Body:
    - vehicleId: <string>
    - amount: <number>
    - date: <string>
    - description: <string>
    - bookingId: <string> (optional)
    - attachment: <string> (optional)
    
/* ========================================================================== */
const add_expense = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { vehicleId, amount, date, description } = request.body;
    const { bookingId, attachment } = request.body;
    if (!vehicleId || !amount || !date || !description) {
      throw new Error("Missing required fields.");
    }

    // Get Vehicle
    const vehicle = await getDocument("Vehicles", vehicleId);

    // Create Expense Payload
    const payload = {
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        license: vehicle.license,
      },
      date: constructDateObject(date, "00:00:00"),
      amount,
      description,
      date_created: new Date(),
    };
    if (bookingId) payload.bookingId = bookingId;
    if (attachment) payload.attachment = attachment;

    // Upload Expense
    const expenseId = await addDocument("Expenses", payload);

    // Send Response
    response.status(200).json({ expenseId });

    // Handle Error
  } catch (err) {
    logError("admin_add_expense:", err.message);
    response.status(500).send("Error adding expenses.");
  }
};

module.exports = add_expense;
