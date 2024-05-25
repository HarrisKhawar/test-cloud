// Server: Express
const express = require("express");
const app = express();

// Import Middleware
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");
const cors = require("cors");

// * ======================================================================================== * //
// #region IMPORT ADMIN FUNCTIONS
// * ======================================================================================== * //
// Import Admin Functions: Other
const { admin_fetch_all_data } = require("./admin/fetch-all-data");
// Import Admin Functions: Bookings
const { admin_fetch_booking } = require("./admin/bookings/fetch-booking");
const {
  admin_fetch_all_bookings,
} = require("./admin/bookings/fetch-all-bookings");
const {
  admin_create_booking,
} = require("./admin/bookings/create-booking");
const { admin_start_booking } = require("./admin/bookings/start-booking");
const {
  admin_complete_booking,
} = require("./admin/bookings/complete-booking");
// Import Admin Functions: Customers
const {
  admin_fetch_customer,
} = require("./admin/customers/fetch-customer");
const {
  admin_fetch_all_customers,
} = require("./admin/customers/fetch-all-customers");
// Import Admin Functions: Payments
const { admin_fetch_payment } = require("./admin/payments/fetch-payment");
const {
  admin_fetch_all_payments,
} = require("./admin/payments/fetch-all-payments");
const { admin_add_payment } = require("./admin/payments/add-payment");
// Import Admin Functions: Tolls
const { admin_fetch_toll } = require("./admin/tolls/fetch-toll");
const {
  admin_fetch_booking_tolls,
} = require("./admin/tolls/fetch-booking-tolls");
const { admin_fetch_tolls } = require("./admin/tolls/fetch-all-tolls");
const { admin_upload_tolls } = require("./admin/tolls/upload-tolls");
// Import Admin Functions: Vehicles
const { admin_fetch_vehicle } = require("./admin/vehicles/fetch-vehicle");
const {
  admin_fetch_all_vehicles,
} = require("./admin/vehicles/fetch-all-vehicles");
const { admin_add_vehicle } = require("./admin/vehicles/add-vehicle");
const { admin_edit_vehicle } = require("./admin/vehicles/edit-vehicle");
const {
  admin_delete_vehicle,
} = require("./admin/vehicles/delete-vehicle");
const {
  admin_control_vehicle,
} = require("./admin/vehicles/control-vehicle");
const { admin_smartcar_auth } = require("./admin/vehicles/smartcar-auth");
// #endregion
// * ======================================================================================== * //

// * ======================================================================================== * //
// #region IMPORT PUBLIC FUNCTIONS
// * ======================================================================================== * //
const { fetch_all_vehicles } = require("./public/fetch-all-vehicles");
const { fetch_price } = require("./public/fetch-price");
const {
  fetch_subscription_plans,
} = require("./public/fetch-subscription-plans");
const { fetch_vehicles } = require("./public/fetch-vehicles");
// #endregion
// * ======================================================================================== * //

// * ======================================================================================== * //
// #region IMPORT CUSTOMER FUNCTIONS
// * ======================================================================================== * //
// Import Customer Functions: Bookings
const { fetch_booking } = require("./customer/bookings/fetch-booking");
const { create_booking } = require("./customer/bookings/create-booking");

// Import Customer Functions: Customers
const { fetch_customer } = require("./customer/customers/fetch-customer");
const { create_customer } = require("./customer/customers/create-customer");
const {
  add_drivers_license,
} = require("./customer/customers/add-drivers-license");
const {
  add_insurance_documents,
} = require("./customer/customers/add-insurance-document");
const {
  send_phone_verification_code,
} = require("./customer/customers/send-phone-verification-code");
const {
  verify_phone_number,
} = require("./customer/customers/verify-phone-number");

// Import Customer Functions: Payments
const { fetch_payments } = require("./customer/payments/fetch-payments");
const {
  add_payment_method,
} = require("./customer/payments/add-payment-method");

// Import Customer Functions: Subscription
const {
  add_subscription_plan,
} = require("./customer/subscription/add-subscription-plan");

// Import Customer Functions: Messages
const { send_message } = require("./customer/customers/send-message");
const { fetch_messages } = require("./customer/customers/fetch-messages");
// #endregion
// * ======================================================================================== * //

// * ======================================================================================== * //
// #region IMPORT WEBHOOK FUNCTIONS
// * ======================================================================================== * //
const { stripe_webhook } = require("./webhooks/stripe-webhook");
const { smartcar_exchange } = require("./webhooks/smartcar-exchange");
// #endregion
// * ======================================================================================== * //

// * ======================================================================================== * //
// #region CONFIGURE MIDDLEWARE
// * ======================================================================================== * //
// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Enable CORS
app.use(cors({ origin: true }));

// Enable Body Parser
app.use(express.json());
// #endregion
// * ======================================================================================== * //

// * ======================================================================================== * //
// #region ADMIN API ROUTES
// * ======================================================================================== * //
app.post("/admin_fetch_all_data", (req, res) => {
  admin_fetch_all_data(req, res);
});

// * API Routes for Bookings Operations
app.post("/admin_fetch_booking", (req, res) => {
  admin_fetch_booking(req, res);
});
app.post("/admin_fetch_all_bookings", (req, res) => {
  admin_fetch_all_bookings(req, res);
});
app.post("/admin_create_booking", (req, res) => {
  admin_create_booking(req, res);
});
app.post("/admin_start_booking", (req, res) => {
  admin_start_booking(req, res);
});
app.post("/admin_complete_booking", (req, res) => {
  admin_complete_booking(req, res);
});

// * API Routes for Customers Operations
app.post("/admin_fetch_customer", (req, res) => {
  admin_fetch_customer(req, res);
});
app.post("/admin_fetch_all_customers", (req, res) => {
  admin_fetch_all_customers(req, res);
});

// * API Routes for Payments Operations
app.post("/admin_fetch_payment", (req, res) => {
  admin_fetch_payment(req, res);
});
app.post("/admin_fetch_all_payments", (req, res) => {
  admin_fetch_all_payments(req, res);
});
app.post("/admin_add_payment", (req, res) => {
  admin_add_payment(req, res);
});

// * API Routes for Tolls Operations
app.post("/admin_fetch_toll", (req, res) => {
  admin_fetch_toll(req, res);
});
app.post("/admin_fetch_booking_tolls", (req, res) => {
  admin_fetch_booking_tolls(req, res);
});
app.post("/admin_fetch_tolls", (req, res) => {
  admin_fetch_tolls(req, res);
});
app.post("/admin_upload_tolls", (req, res) => {
  admin_upload_tolls(req, res);
});

// * API Routes for Vehicles Operations
app.post("/admin_fetch_vehicle", (req, res) => {
  admin_fetch_vehicle(req, res);
});
app.post("/admin_fetch_all_vehicles", (req, res) => {
  admin_fetch_all_vehicles(req, res);
});
app.post("/admin_add_vehicle", (req, res) => {
  admin_add_vehicle(req, res);
});
app.post("/admin_edit_vehicle", (req, res) => {
  admin_edit_vehicle(req, res);
});
app.post("/admin_delete_vehicle", (req, res) => {
  admin_delete_vehicle(req, res);
});
app.post("/admin_control_vehicle", (req, res) => {
  admin_control_vehicle(req, res);
});
app.post("/admin_smartcar_auth", (req, res) => {
  admin_smartcar_auth(req, res);
});
// #endregion
// * ======================================================================================== * //

// * ======================================================================================== * //
// #region PUBLIC API ROUTES
// * ======================================================================================== * //
app.post("/fetch_all_vehicles", (req, res) => {
  fetch_all_vehicles(req, res);
});
app.post("/fetch_price", (req, res) => {
  fetch_price(req, res);
});
app.post("/fetch_subscription_plans", (req, res) => {
  fetch_subscription_plans(req, res);
});
app.post("/fetch_vehicles", (req, res) => {
  fetch_vehicles(req, res);
});
// #endregion
// * ======================================================================================== * //

// * ======================================================================================== * //
// #region CUSTOMER API ROUTES
// * ======================================================================================== * //
// * API Routes for Bookings Operations
app.post("/fetch_booking", (req, res) => {
  fetch_booking(req, res);
});
app.post("/create-booking", (req, res) => {
  create_booking(req, res);
});

// * API Routes for Customers Operations
app.post("/fetch_customer", (req, res) => {
  fetch_customer(req, res);
});
app.post("/create_customer", (req, res) => {
  create_customer(req, res);
});
app.post("add_drivers_license", (req, res) => {
  add_drivers_license(req, res);
});
app.post("/add_insurance_documents", (req, res) => {
  add_insurance_documents(req, res);
});
app.post("/send_phone_verification_code", (req, res) => {
  send_phone_verification_code(req, res);
});
app.post("/verify_phone_number", (req, res) => {
  verify_phone_number(req, res);
});

// * API Routes for Payments Operations
app.post("/fetch_payments", (req, res) => {
  fetch_payments(req, res);
});
app.post("/add_payment_method", (req, res) => {
  add_payment_method(req, res);
});

// * API Routes for Subscriptions Operations
app.post("/add_subscription_plan", (req, res) => {
  add_subscription_plan(req, res);
});

// * API Routes for Chat Operations
app.post("/send_message", (req, res) => {
  send_message(req, res);
});
app.post("/fetch_messages", (req, res) => {
  fetch_messages(req, res);
});
// #endregion
// * ======================================================================================== * //

// * ======================================================================================== * //
// #region WEBHOOKS
// * ======================================================================================== * //
// Webhook for Stripe Payment Status Updates
app.post("/webhooks/stripe", express.raw({type: "application/json"}), (req, res) => {
  stripe_webhook(req, res);
});
app.get("/webhooks/smartcar_exchange", (req, res) => {
  smartcar_exchange(req, res);
});
// #endregion
// * ======================================================================================== * //

// * ======================================================================================== * //
// #region START SERVER
// * ======================================================================================== * //
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(
    `Server listening on port ${port}`,
    process.env.GOOGLE_CLOUD_PROJECT_ID
  );
});
// #endregion
// * ======================================================================================== * //
