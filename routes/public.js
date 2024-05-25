const router = require("express").Router();

// ====================================================
// #region CONFIGURE HANDLERS FOR PUBLIC API ROUTES

router.post("/fetch-data", (req, res) => {
  const handler = require("../public/fetch-data");
  handler(req, res);
});
router.post("/fetch-all-vehicles", (req, res) => {
  const handler = require("../public/fetch-all-vehicles");
  handler(req, res);
});
router.post("/fetch-price", (req, res) => {
  const handler = require("../public/fetch-price");
  handler(req, res);
});
router.post("/fetch-subscription-plans", (req, res) => {
  const handler = require("../public/fetch-subscription-plans");
  handler(req, res);
});
router.post("/fetch-vehicles", (req, res) => {
  const handler = require("../public/fetch-vehicles");
  handler(req, res);
});
router.post("/add-review", (req, res) => {
  const handler = require("../public/add-review");
  handler(req, res);
});
router.post("/send-message", (req, res) => {
  const handler = require("../public/send-message");
  handler(req, res);
});

// #endregion
// ====================================================

module.exports = router;