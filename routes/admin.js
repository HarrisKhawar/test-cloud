const router = require("express").Router();

// ====================================================
// #region CONFIGURE HANDLERS FOR ADMIN API ROUTES

// *************** ALL DATA *************** /
router.post("/fetch-all-data", (req, res) => {
  const handler = require("../admin/fetch-all-data");
  handler(req, res);
});

// *************** BOOKINGS *************** /
router.post("/fetch-booking", (req, res) => {
  const handler = require("../admin/bookings/fetch-booking");
  handler(req, res);
});
router.post("/fetch-all-bookings", (req, res) => {
  const handler = require("../admin/bookings/fetch-all-bookings");
  handler(req, res);
});
router.post("/create-booking", (req, res) => {
  const handler = require("../admin/bookings/create-booking");
  handler(req, res);
});
router.post("/start-booking", (req, res) => {
  const handler = require("../admin/bookings/start-booking");
  handler(req, res);
});
router.post("/extend-booking", (req, res) => {
  const handler = require("../admin/bookings/extend-booking");
  handler(req, res);
});
router.post("/complete-booking", (req, res) => {
  const handler = require("../admin/bookings/complete-booking");
  handler(req, res);
});
router.post("/cancel-booking", (req, res) => {
  const handler = require("../admin/bookings/cancel-booking");
  handler(req, res);
});
router.post("/force-agreement", (req, res) => {
  const handler = require("../admin/bookings/force-agreement");
  handler(req, res);
});

// *************** CUSTOMERS *************** /
router.post("/fetch-customer", (req, res) => {
  const handler = require("../admin/customers/fetch-customer");
  handler(req, res);
});
router.post("/edit-customer", (req, res) => {
  const handler = require("../admin/customers/edit-customer.js");
  handler(req, res);
});
router.post("/fetch-all-customers", (req, res) => {
  const handler = require("../admin/customers/fetch-all-customers");
  handler(req, res);
});
router.post("/send-message", (req, res) => {
  const handler = require("../admin/customers/send-message");
  handler(req, res);
});
router.post("/add-to-dnr", (req, res) => {
  const handler = require("../admin/customers/add-to-dnr");
  handler(req, res);
});
router.post("/start-screening", (req, res) => {
  const handler = require("../admin/customers/start-screening");
  handler(req, res);
});
router.post("/check-screening-status", (req, res) => {
  const handler = require("../admin/customers/check-screening-status");
  handler(req, res);
});

// *************** PARTNERS *************** /
router.post("/fetch-all-partners", (req, res) => {
  const handler = require("../admin/partners/fetch-all-partners");
  handler(req, res);
});
router.post("/fetch-partner", (req, res) => {
  const handler = require("../admin/partners/fetch-partner");
  handler(req, res);
});
router.post("/edit-partner", (req, res) => {
  const handler = require("../admin/partners/edit-partner");
  handler(req, res);
});
router.post("/add-partner-vehicle", (req, res) => {
  const handler = require("../admin/partners/add-partner-vehicle");
  handler(req, res);
});
router.post("/edit-partner-vehicle", (req, res) => {
  const handler = require("../admin/partners/edit-partner-vehicle");
  handler(req, res);
});
router.post("/activate-vehicle", (req, res) => {
  const handler = require("../admin/partners/activate-vehicle");
  handler(req, res);
});
router.post("/deactivate-vehicle", (req, res) => {
  const handler = require("../admin/partners/deactivate-vehicle");
  handler(req, res);
});
router.post("/fetch-all-invoices", (req, res) => {
  const handler = require("../admin/partners/fetch-all-invoices");
  handler(req, res);
});
router.post("/fetch-invoice", (req, res) => {
  const handler = require("../admin/partners/fetch-invoice");
  handler(req, res);
});
router.post("/add-partner-payment", (req, res) => {
  const handler = require("../admin/partners/add-partner-payment");
  handler(req, res);
});
router.post("/delete-partner-payment", (req, res) => {
  const handler = require("../admin/partners/delete-partner-payment");
  handler(req, res);
});

// *************** EXPENSES *************** /
router.post("/fetch-all-expenses", (req, res) => {
  const handler = require("../admin/expenses/fetch-all-expenses");
  handler(req, res);
});
router.post("/fetch-expense", (req, res) => {
  const handler = require("../admin/expenses/fetch-expense");
  handler(req, res);
});
router.post("/add-expense", (req, res) => {
  const handler = require("../admin/expenses/add-expense");
  handler(req, res);
});
router.post("/delete-expense", (req, res) => {
  const handler = require("../admin/expenses/delete-expense");
  handler(req, res);
});

// *************** PAYMENTS *************** /
router.post("/fetch-payment", (req, res) => {
  const handler = require("../admin/payments/fetch-payment");
  handler(req, res);
});
router.post("/fetch-all-payments", (req, res) => {
  const handler = require("../admin/payments/fetch-all-payments");
  handler(req, res);
});
router.post("/add-payment", (req, res) => {
  const handler = require("../admin/payments/add-payment");
  handler(req, res);
});
router.post("/charge-invoice", (req, res) => {
  const handler = require("../admin/payments/charge-invoice");
  handler(req, res);
});
router.post("/pay-invoice", (req, res) => {
  const handler = require("../admin/payments/pay-invoice");
  handler(req, res);
});
router.post("/refund-payment", (req, res) => {
  const handler = require("../admin/payments/refund-payment");
  handler(req, res);
});
router.post("/delete-invoice", (req, res) => {
  const handler = require("../admin/payments/delete-invoice");
  handler(req, res);
});
router.post("/create-stripe-invoice", (req, res) => {
  const handler = require("../admin/payments/create-stripe-invoice");
  handler(req, res);
});

// *************** COUPONS *************** /
router.post("/fetch-coupon", (req, res) => {
  const handler = require("../admin/coupons/fetch-coupon");
  handler(req, res);
});
router.post("/fetch-all-coupons", (req, res) => {
  const handler = require("../admin/coupons/fetch-all-coupons");
  handler(req, res);
});
router.post("/add-coupon", (req, res) => {
  const handler = require("../admin/coupons/add-coupon");
  handler(req, res);
});

// *************** TOLLS *************** /
router.post("/fetch-toll", (req, res) => {
  const handler = require("../admin/tolls/fetch-toll");
  handler(req, res);
});
router.post("/fetch-booking-tolls", (req, res) => {
  const handler = require("../admin/tolls/fetch-booking-tolls");
  handler(req, res);
});
router.post("/fetch-tolls", (req, res) => {
  const handler = require("../admin/tolls/fetch-tolls");
  handler(req, res);
});
router.post("/upload-tolls", (req, res) => {
  const handler = require("../admin/tolls/upload-tolls");
  handler(req, res);
});

// *************** CHARGING *************** /
router.post("/upload-charging", (req, res) => {
  const handler = require("../admin/charging/upload-charging");
  handler(req, res);
});
router.post("/fetch-all-charging", (req, res) => {
  const handler = require("../admin/charging/fetch-all-charging");
  handler(req, res);
});
router.post("/fetch-booking-charging", (req, res) => {
  const handler = require("../admin/charging/fetch-booking-charging");
  handler(req, res);
});

// *************** VEHICLES *************** /
router.post("/fetch-vehicle", (req, res) => {
  const handler = require("../admin/vehicles/fetch-vehicle");
  handler(req, res);
});
router.post("/fetch-all-vehicles", (req, res) => {
  const handler = require("../admin/vehicles/fetch-all-vehicles");
  handler(req, res);
});
router.post("/add-vehicle", (req, res) => {
  const handler = require("../admin/vehicles/add-vehicle");
  handler(req, res);
});
router.post("/edit-vehicle", (req, res) => {
  const handler = require("../admin/vehicles/edit-vehicle");
  handler(req, res);
});
router.post("/delete-vehicle", (req, res) => {
  const handler = require("../admin/vehicles/delete-vehicle");
  handler(req, res);
});
router.post("/fetch-vehicle-revenue", (req, res) => {
  const handler = require("../admin/vehicles/fetch-vehicle-revenue");
  handler(req, res);
});
router.post("/fetch-locations", (req, res) => {
  const handler = require("../admin/vehicles/fetch-locations");
  handler(req, res);
});
router.post("/fetch-brands", (req, res) => {
  const handler = require("../admin/vehicles/fetch-brands");
  handler(req, res);
});
router.post("/add-brand", (req, res) => {
  const handler = require("../admin/vehicles/add-brand");
  handler(req, res);
});
router.post("/control-vehicle", (req, res) => {
  const handler = require("../admin/vehicles/control-vehicle");
  handler(req, res);
});
router.post("/smartcar-auth", (req, res) => {
  const handler = require("../admin/vehicles/smartcar-auth");
  handler(req, res);
});
router.post("/exchange-code", (req, res) => {
  const handler = require("../admin/vehicles/exchange-smartcar-code");
  handler(req, res);
});

// #endregion
// ====================================================

module.exports = router;
