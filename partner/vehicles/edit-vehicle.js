const { logError } = require("../../util/logs/logging");
const { documentExists } = require("../../util/firestore/document-exists");
const {
  setSubcollectionDocument,
} = require("../../util/firestore/set-subcollection-document");
const { handleRequest } = require("../request-handling/handle-request");
const { logSuccess } = require("../../util/logs/logging");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const { getDocument } = require("../../util/firestore/get-document");
const {
  getSubcollectionDocument,
} = require("../../util/firestore/get-subcollection-document");
/* ==========================================================================
 * VEHICLE: EDIT VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - vin: <string>
    - make: <string> (YYYY-MM-DD)
    - model: <string>
    - year: <string>
    - license: <link>
    - bos: <link>
    - title: <link>
    - registeration: <link>
    - vir: <link>
    - insurance: <link>
    - poa: <link>
    - financed: <boolean>
    - institution: <string>
    - amount: <number>
    - term: <number>
    - monthly: <number>
    - loan: <link>
/* ========================================================================== */
const edit_vehicle = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const {
      vin,
      make,
      model,
      year,
      license,
      state,
      bos,
      title,
      registration,
      vir,
      insurance,
      financed,
      institution,
      amount,
      term,
      monthly,
      loan,
      due,
    } = request.body;
    if (!vin || !make || !model || !year)
      throw new Error("Missing required fields.");

    // Get Partner
    if (!(await documentExists("Partners", partnerId)))
      throw new Error("Partner account not found.");
    const partner = await getDocument("Partners", partnerId);

    // Get Vehicle
    const vehicle = await getSubcollectionDocument(
      "Partners",
      partnerId,
      "Vehicles",
      vin
    );
    if (!vehicle) throw new Error("Vehicle not found.");
    if (vehicle.status === "active")
      throw new Error("Cannot edit an active vehicle.");

    // Create Vehicle Object
    const update = { make, model, year };
    if (license) update.license = license;
    if (state) update.state = state;
    if (bos) update.bos = bos;
    if (title) update.title = title;
    if (registration) update.registration = registration;
    if (vir) update.vir = vir;
    if (insurance) update.insurance = insurance;
    if (financed) update.financed = financed;
    if (institution) update.institution = institution;
    if (amount) update.amount = amount;
    if (term) update.term = term;
    if (monthly) update.monthly = monthly;
    if (loan) update.loan = loan;
    if (due) update.due = due;

    // Add Vehicle to Partner
    await setSubcollectionDocument("Partners", partnerId, "Vehicles", vin, {
      ...vehicle,
      ...update,
    });

    // Send Slack Notification
    await sendSlackNotification(
      `Partner ${partner.name} edited ${update.make} ${update.model} ${update.year} - ${update.vin}`
    );

    // Log Success
    logSuccess("edit_vehicle", "Successfully edited vehicle.");

    // Send Response
    response.status(200).json({ partnerId: partnerId });

    // Handle Error
  } catch (err) {
    logError("edit-vehicle:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = edit_vehicle;
