const router = require("express").Router();

// ====================================================
// #region CONFIGURE HANDLERS FOR PUBLIC API ROUTES

// *************** BOOKINGS *************** /
router.post("/fetch-booking", (req, res) => {
  const handler = require("../customer/bookings/fetch-booking.js");
  handler(req, res);
});
router.post("/create-booking", (req, res) => {
  const handler = require("../customer/bookings/create-booking.js");
  handler(req, res);
});
router.post("/add-booking", (req, res) => {
  const handler = require("../customer/bookings/add-booking.js");
  handler(req, res);
});
router.post("/start-booking", (req, res) => {
  const handler = require("../customer/bookings/start-booking.js");
  handler(req, res);
});
router.post("/end-booking", (req, res) => {
  const handler = require("../customer/bookings/end-booking.js");
  handler(req, res);
});
router.post("/fetch-price", (req, res) => {
  const handler = require("../customer/bookings/fetch-price.js");
  handler(req, res);
});
router.post("/request-swap", (req, res) => {
  const handler = require("../customer/bookings/request-swap.js");
  handler(req, res);
});
router.post("/request-roadside", (req, res) => {
  const handler = require("../customer/bookings/request-roadside.js");
  handler(req, res);
});

// *************** CUSTOMERS *************** /
router.post("/fetch-customer", (req, res) => {
  const handler = require("../customer/customers/fetch-customer.js");
  handler(req, res);
});
router.post("/create-customer", (req, res) => {
  const handler = require("../customer/customers/create-customer.js");
  handler(req, res);
});
router.post("/add-profile-photo", (req, res) => {
  const handler = require("../customer/customers/add-profile-photo.js");
  handler(req, res);
});
router.post("/add-drivers-license", (req, res) => {
  const handler = require("../customer/customers/add-drivers-license.js");
  handler(req, res);
});
router.post("/add-drivers-license-info", (req, res) => {
  const handler = require("../customer/customers/add-drivers-license-info.js");
  handler(req, res);
});
router.post("/add-document", (req, res) => {
  const handler = require("../customer/customers/add-document.js");
  handler(req, res);
});
router.post("/add-insurance-documents", (req, res) => {
  const handler = require("../customer/customers/add-insurance-documents.js");
  handler(req, res);
});
router.post("/send-phone-verification-code", (req, res) => {
  const handler = require("../customer/customers/send-phone-verification-code.js");
  handler(req, res);
});
router.post("/verify-phone-number", (req, res) => {
  const handler = require("../customer/customers/verify-phone-number.js");
  handler(req, res);
});
router.post("/add-notification-token", (req, res) => {
  const handler = require("../customer/customers/add-notification-token.js");
  handler(req, res);
});
router.post("/delete-notification-token", (req, res) => {
  const handler = require("../customer/customers/delete-notification-token.js");
  handler(req, res);
});
router.post("/update-settings", (req, res) => {
  const handler = require("../customer/customers/update-settings.js");
  handler(req, res);
});

// *************** PAYMENTS *************** /
router.post("/fetch-all-payments", (req, res) => {
  const handler = require("../customer/payments/fetch-all-payments.js");
  handler(req, res);
});
router.post("/fetch-payment", (req, res) => {
  const handler = require("../customer/payments/fetch-payment.js");
  handler(req, res);
});
router.post("/add-payment-method", (req, res) => {
  const handler = require("../customer/payments/add-payment-method.js");
  handler(req, res);
});
router.post("/delete-payment-method", (req, res) => {
  const handler = require("../customer/payments/delete-payment-method.js");
  handler(req, res);
});
router.post("/pay-invoice", (req, res) => {
  const handler = require("../customer/payments/pay-invoice.js");
  handler(req, res);
});
router.post("/fetch-invoice-pdf", (req, res) => {
  const handler = require("../customer/payments/fetch-pdf.js");
  handler(req, res);
});

// *************** SUBSCRIPTION *************** /
router.post("/fetch-plan-rate", (req, res) => {
  const handler = require("../customer/subscription/fetch-plan-rate.js");
  handler(req, res);
});
router.post("/add-subscription-plan", (req, res) => {
  const handler = require("../customer/subscription/add-plan.js");
  handler(req, res);
});

// *************** MESSAGES *************** /
router.post("/send-message", (req, res) => {
  const handler = require("../customer/messages/send-message.js");
  handler(req, res);
});
router.post("/fetch-all-messages", (req, res) => {
  const handler = require("../customer/messages/fetch-all-messages.js");
  handler(req, res);
});

// *************** VEHICLES *************** /
router.post("/control-vehicle", (req, res) => {
  const handler = require("../customer/vehicles/control-vehicle.js");
  handler(req, res);
});
router.post("/search-vehicles", (req, res) => {
  const handler = require("../customer/vehicles/search-vehicles.js");
  handler(req, res);
});
// #endregion
// ====================================================

module.exports = router;
