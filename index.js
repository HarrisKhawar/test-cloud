const express = require("express");
const app = express();

// ====================================================
// #region IMPORT MIDDLEWARE

const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");
const cors = require("cors");

// #endregion
// ====================================================

// ====================================================
// #region CONFIGURE MIDDLEWARE

// * Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "posh-test-4cf65.appspot.com",
});

// * Configure CORS
app.use(cors({ origin: true }));

// #endregion
// ====================================================

// ====================================================
// #region IMPORT ROUTES

const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");
const customerRoutes = require("./routes/customer");
const partnerRoutes = require("./routes/partner");
const webhooksRoutes = require("./routes/webhooks");

// #endregion
// ====================================================

// ====================================================
// #region CONFIGURE ROUTES

app.use("/admin", express.json(), adminRoutes);
app.use("/public", express.json(), publicRoutes);
app.use("/customer", express.json(), customerRoutes);
app.use("/partner", express.json(), partnerRoutes);
app.use("/webhooks", express.json(), webhooksRoutes);

// #endregion
// ====================================================

// ====================================================
// #region START SERVER

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(
    `Server listening on port ${port}`,
    process.env.GOOGLE_CLOUD_PROJECT_ID
  );
});

// #endregion
// ====================================================
