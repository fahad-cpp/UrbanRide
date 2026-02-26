const express = require("express");
const admin = require("firebase-admin");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const db = admin.firestore();

// ===============================
// GET ALL VEHICLES
// GET /api/vehicles
// ===============================
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("vehicles").get();

    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(vehicles);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// GET SINGLE VEHICLE
// GET /api/vehicles/:id
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("vehicles").doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// ADD VEHICLE (ADMIN ONLY)
// POST /api/vehicles
// ===============================
router.post("/", authMiddleware, async (req, res) => {
  try {
    // optional admin check if using custom claims
    if (!req.user.admin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const docRef = await db.collection("vehicles").add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===============================
// UPDATE VEHICLE (ADMIN ONLY)
// PUT /api/vehicles/:id
// ===============================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.collection("vehicles").doc(req.params.id).update(req.body);

    res.json({ message: "Vehicle updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===============================
// DELETE VEHICLE (ADMIN ONLY)
// DELETE /api/vehicles/:id
// ===============================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await db.collection("vehicles").doc(req.params.id).delete();

    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;