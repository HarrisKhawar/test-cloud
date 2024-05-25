const router = require("express").Router();

// ====================================================
// #region CONFIGURE HANDLERS FOR PARTNER API ROUTES

// *************** PARTNERS *************** /
router.post("/fetch-partner", (req, res) => {
  const handler = require("../partner/partners/fetch-partner");
  handler(req, res);
});
router.post("/create-partner", (req, res) => {
  const handler = require("../partner/partners/create-partner");
  handler(req, res);
});
router.post("/edit-partner", (req, res) => {
  const handler = require("../partner/partners/edit-partner");
  handler(req, res);
});
router.post("/add-drivers-license", (req, res) => {
  const handler = require("../partner/partners/add-drivers-license");
  handler(req, res);
});
router.post("/generate-agreement", (req, res) => {
  const handler = require("../partner/partners/generate-agreement");
  handler(req, res);
});
router.post("/add-bank-info", (req, res) => {
  const handler = require("../partner/partners/add-bank-info");
  handler(req, res);
});
router.post("/submit-credit-app", (req, res) => {
  const handler = require("../partner/partners/submit-credit-app");
  handler(req, res);
});
router.post("/sign-credit-app", (req, res) => {
  const handler = require("../partner/partners/sign-credit-app");
  handler(req, res);
});

// *************** VEHICLES *************** /
router.post("/fetch-vehicle", (req, res) => {
  const handler = require("../partner/vehicles/fetch-vehicle");
  handler(req, res);
});
router.post("/add-vehicle", (req, res) => {
  const handler = require("../partner/vehicles/add-vehicle");
  handler(req, res);
});
router.post("/edit-vehicle", (req, res) => {
  const handler = require("../partner/vehicles/edit-vehicle");
  handler(req, res);
});
router.post("/get-vehicle-stats", (req, res) => {
  const handler = require("../partner/vehicles/get-vehicle-stats");
  handler(req, res);
});
router.post("/generate-poa", (req, res) => {
  const handler = require("../partner/vehicles/generate-poa");
  handler(req, res);
});
router.post("/generate-vehicle-agreement", (req, res) => {
  const handler = require("../partner/vehicles/generate-vehicle-agreement");
  handler(req, res);
});

// *************** PAYMENTS *************** /
router.post("/request-payment", (req, res) => {
  const handler = require("../partner/payments/request-payment");
  handler(req, res);
});

module.exports = router;