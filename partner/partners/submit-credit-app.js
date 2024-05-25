const { updateDocument } = require("../../util/firestore/update-document");
const { handleRequest } = require("../request-handling/handle-request");
const { logError } = require("../../util/logs/logging");
const {
  sendSlackNotification,
} = require("../../util/slack/send-slack-notification");
const { getDocument } = require("../../util/firestore/get-document");

/* ==========================================================================
 * PARTNER: SUBMIT CREDIT APPLICATION
/* ==========================================================================

* Request Headers: 
  Authorization: <access token>
  idToken: <firebase auth token>
  userId: <string>

* Request Body:
  - drivers_license_number: <string>
  - phone: <string>
  - ssn: <string>
  - dob: <string>
  - residence_type: <string>
  - monthly_rent: <string>
  - years_at_residence: <string>
  - months_at_residence: <string>
  - employer: <string>
  - occupation: <string>
  - employment_years: <string>
  - monthly_salary: <string>
  - other_income: <string>
  - tax_returns_1: <string>
  - tax_returns_2: <string>
  - ssn_front: <string>
  - proof_of_residence: <string>
  - pay_stubs: <string>
  - bank_statements: <string>
  - selfie_id: <string>
/* ========================================================================== */
const submit_credit_app = async (request, response) => {
  try {
    // Handle Request
    if (await handleRequest(request, response)) return;

    // Confirm Required Fields
    const { userid: partnerId } = request.headers;
    const {
      drivers_license_number,
      phone,
      ssn,
      dob,
      residence_type,
      monthly_rent,
      years_at_residence,
      months_at_residence,
      employer,
      occupation,
      employment_years,
      monthly_salary,
      other_income,
      tax_returns_1,
      tax_returns_2,
      ssn_front,
      proof_of_residence,
      pay_stubs,
      bank_statements,
      selfie_id,
    } = request.body;

    // Add Bank Information
    await updateDocument("Partners", partnerId, {
      drivers_license_number,
      phone,
      ssn,
      dob,
      residence_type,
      monthly_rent,
      years_at_residence,
      months_at_residence,
      employer,
      occupation,
      employment_years,
      monthly_salary,
      other_income,
      tax_returns_1,
      tax_returns_2,
      ssn_front,
      proof_of_residence,
      pay_stubs,
      bank_statements,
      selfie_id,
      credit_app: true,
      credit_app_agreement: false,
    });

    // Send Slack Notification
    const partner = await getDocument("Partners", partnerId);
    await sendSlackNotification(
      "Partner " + partner.name + " completed credit application."
    );

    // Send Response
    response.status(200).json({ message: "Done" });

    // Handle Error
  } catch (err) {
    logError("submit-credit-app:", err.message);
    response.status(500).send(err.message);
  }
};

module.exports = submit_credit_app;
