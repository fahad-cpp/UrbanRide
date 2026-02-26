// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// FIREBASE INITIALIZATION
// ==========================================
const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

// ==========================================
// AUTH MIDDLEWARE
// ==========================================
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

// Make db and admin available to all routes
app.use((req, res, next) => {
  req.db = db;
  req.admin = admin;
  next();
});

// ==========================================
// ROUTES
// ==========================================

// Test route
app.get("/", (req, res) => {
  res.send("Firebase Car Rental API Running");
});

// ---------- REGISTER ----------
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      createdAt: new Date(),
    });

    res.status(201).json({ uid: userRecord.uid, email: userRecord.email, name: userRecord.displayName });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// ---------- LOGIN ----------
app.post("/api/auth/login", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "ID token required" });

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    res.status(200).json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (err) {
    res.status(401).json({ message: "Invalid ID token" });
  }
});

// ---------- PROTECTED EXAMPLE ----------
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// ---------- ORIGINAL ROUTES ----------
app.use("/api/vehicles", require("./routes/vehicleRoutes")); // No auth middleware, or add if needed
app.use("/api/bookings", require("./routes/bookingRoutes")(authMiddleware));
app.use("/api/auth", require("./routes/authRoutes")); // Optional if you have other auth routes

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});