require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

const ADMIN_EMAIL = "admin@gmail.com";

function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: no user found" });
  }
  const isAdmin =
    req.user.email === ADMIN_EMAIL ||
    req.user.admin === true ||
    req.user.role === "admin";
  if (!isAdmin) {
    return res.status(403).json({ message: "Forbidden: admin access required" });
  }
  next();
}

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.use((req, res, next) => {
  req.db = db;
  req.admin = admin;
  next();
});


app.get("/", (req, res) => {
  res.send("Firebase Car Rental API Running");
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

app.use("/api/vehicles", require("./routes/vehicleRoutes")(authMiddleware, adminMiddleware));
app.use("/api/bookings", require("./routes/bookingRoutes")(authMiddleware, adminMiddleware));
app.use("/api/auth", require("./routes/authRoutes")); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});