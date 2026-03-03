const express = require("express");

module.exports = (authMiddleware) => {
  const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      totalDays,
      totalPrice,
      status,
      paymentStatus,
      confirmationEmail,
    } = req.body;

    // Ensure required fields exist
    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const docRef = await req.db.collection("bookings").add({
      userId: req.user.uid,
      vehicleId,
      startDate,
      endDate,
      pickupLocation: pickupLocation || null,
      dropoffLocation: dropoffLocation || null,
      totalDays: totalDays || null,
      totalPrice: totalPrice || null,
      status: status || "pending",
      paymentStatus: paymentStatus || "unpaid",
      confirmationEmail: confirmationEmail || null,
      createdAt: req.admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

  router.get("/my", authMiddleware, async (req, res) => {
    try {
      const snapshot = await req.db
        .collection("bookings")
        .where("userId", "==", req.user.uid)
        .get();

      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get("/admin", authMiddleware , async (req, res) => {
    try{
      const snapshot = await req.db
      .collection("bookings")
      .get();

      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("All bookings");
      console.log(bookings)

      res.json(bookings);
    }catch(err){
      console.log(err.message);
      res.status(500).json({message:err.message});
    }
  })

  return router;
};