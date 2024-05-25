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
/* ==========================================================================
 * ADMIN: ADD PARTNER VEHICLE
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>
    
* Request Body:
    - partnerId: <string>
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
const add_partner_vehicle = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const {
      partnerId,
      vin,
      make,
      model,
      year,
      license,
      bos,
      title,
      registeration,
      vir,
      insurance,
      poa,
      financed,
      institution,
      amount,
      term,
      monthly,
      loan,
    } = request.body;
    if (!vin || !make || !model || !year)
      throw new Error("Missing required fields.");

    // Get Partner
    if (!(await documentExists("Partners", partnerId)))
      throw new Error("Partner account not found.");
    const partner = await getDocument("Partners", partnerId);

    // Create Vehicle Object
    const vehicle = { date_created: new Date(), vin, make, model, year };
    if (license) vehicle.license = license;
    if (bos) vehicle.bos = bos;
    if (title) vehicle.title = title;
    if (registeration) vehicle.registeration = registeration;
    if (vir) vehicle.vir = vir;
    if (insurance) vehicle.insurance = insurance;
    if (poa) vehicle.poa = poa;
    if (financed) vehicle.financed = financed;
    if (institution) vehicle.institution = institution;
    if (amount) vehicle.amount = amount;
    if (term) vehicle.term = term;
    if (monthly) vehicle.monthly = monthly;
    if (loan) vehicle.loan = loan;

    // Set Vehicle status
    vehicle.status = "pending";
    vehicle.partner = {
      name: partner.name,
      id: partnerId,
    };

    // Add Vehicle to Partner
    await setSubcollectionDocument(
      "Partners",
      partnerId,
      "Vehicles",
      vin,
      vehicle
    );

    // Send Slack Notification
    await sendSlackNotification(
      `Admin added a ${vehicle.make} ${vehicle.model} ${vehicle.year} for ${partner.name} - ${vehicle.vin}`, "#admin"
    );

    // Log Success
    logSuccess("admin_add_vehicle", "Successfully added vehicle to partner.");

    // Send Response
    response.status(200).json({ partnerId: partnerId });

    // Handle Error
  } catch (err) {
    logError("add-vehicle:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = add_partner_vehicle;
