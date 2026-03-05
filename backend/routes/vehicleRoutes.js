const express = require("express");
const admin = require("firebase-admin");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const db = admin.firestore();

//vehicle table
//id
//brand
//model
//year
//type
//seats
//fuelType
//transmission
//pricePerDay
//location
//images
//features
//isAvailable
//createdAt : timestamp

router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("vehicles").get();

    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(vehicles)
    res.json(vehicles);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});


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


router.post("/", authMiddleware, async (req, res) => {
  try {

    const docRef = await db.collection("vehicles").add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.put("/:id", authMiddleware, async (req, res) => {
  try {

    await db.collection("vehicles").doc(req.params.id).update(req.body);

    res.json({ message: "Vehicle updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await db.collection("vehicles").doc(req.params.id).delete();

    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;