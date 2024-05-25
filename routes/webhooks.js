const express = require("express");
const router = express.Router();

// ====================================================
// #region CONFIGURE HANDLERS FOR WEBHOOKS

// *************** STRIPE *************** //
router.post(
  "/stripe-events",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const handler = require("../hooks/stripe-events");
    handler(req, res);
  }
);

// *************** SMARTCAR *************** //
router.get("/smartcar-exchange", express.json(), (req, res) => {
  const handler = require("../hooks/exchange-smartcar-code");
  handler(req, res);
});

// *************** TOPGUN *************** //
router.post("/topgun-contact-service", (req, res) => {
  const handler = require("../topgun/contact-service");
  handler(req, res);
});

// *************** Webhooks *************** //
router.post("/digisure/screening", (req, res) => {
  const handler = require("../hooks/digisure");
  handler(req, res);
});
router.post("/gcs/bookings-update", (req, res) => {
  const handler = require("../hooks/gcs-bookings-update");
  handler(req, res);
});

router.post("/support-reply", (req, res) => {
  const handler = require("../hooks/support-reply");
  handler(req, res);
});


// #endregion
// ====================================================

module.exports = router;
