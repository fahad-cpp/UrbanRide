const express = require("express");
const admin = require("firebase-admin");

module.exports = (authMiddleware, adminMiddleware) => {
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

// Get featured vehicles (homepage - only 4 vehicles)
router.get("/featured", async (req, res) => {
  try {
    const snapshot = await db.collection("vehicles")
      .limit(4)
      .get();

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

// Get paginated vehicles (for search/listings)
router.get("/paginated", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const location = req.query.location;

    let query = db.collection("vehicles");

    // Filter by location if provided
    if (location) {
      query = query.where("location", "==", location);
    }

    // Get total count for pagination
    const countSnapshot = await query.get();
    const totalCount = countSnapshot.size;

    // Get paginated results
    const startIndex = (page - 1) * limit;
    const snapshot = await query
      .limit(limit)
      .offset(startIndex)
      .get();

    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      vehicles,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get all vehicles — admin only
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
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

// Get single vehicle by ID
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

// Create vehicle — admin only
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
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

// Update vehicle — admin only
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.collection("vehicles").doc(req.params.id).update(req.body);

    res.json({ message: "Vehicle updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete vehicle — admin only
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.collection("vehicles").doc(req.params.id).delete();

    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

return router;
};