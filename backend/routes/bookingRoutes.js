const express = require("express");
const { sendBookingConfirmationEmail } = require("../utils/emailService");

module.exports = (authMiddleware, adminMiddleware) => {
  const router = express.Router();

  router.post("/", authMiddleware, async (req, res) => {
    try {
      const {
        vehicleId, startDate, endDate, pickupLocation, dropoffLocation,
        totalDays, totalPrice, status, paymentStatus, confirmationEmail,
      } = req.body;

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

      // Send booking confirmation email
      if (confirmationEmail) {
        try {
          // Fetch vehicle details for the email
          const vehicleDoc = await req.db.collection("vehicles").doc(vehicleId).get();
          const vehicleData = vehicleDoc.exists ? vehicleDoc.data() : {};

          await sendBookingConfirmationEmail(confirmationEmail, {
            userName: req.user.name || req.user.email?.split("@")[0] || "Customer",
            bookingId: docRef.id,
            vehicleName: vehicleData.name || vehicleId,
            vehicleBrand: vehicleData.brand || "",
            startDate,
            endDate,
            totalDays: totalDays || 0,
            totalPrice: totalPrice || 0,
            pickupLocation: pickupLocation || vehicleData.location || "N/A",
          });
        } catch (emailErr) {
          console.error("Booking email send failed:", emailErr.message);
          // Non-fatal — booking is already saved
        }
      }

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

      const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const snapshot = await req.db.collection("bookings").get();
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(bookings);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  });

  // Update booking status — admin only
  router.patch("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const allowed = ["pending", "confirmed", "cancelled"];
      if (!status || !allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      await req.db.collection("bookings").doc(req.params.id).update({ status });
      res.json({ message: "Booking status updated", status });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Delete a booking — admin only
  router.delete("/:id", authMiddleware , async (req, res) => {
    try {
      await req.db.collection("bookings").doc(req.params.id).delete();
      res.json({ message: "Booking deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};