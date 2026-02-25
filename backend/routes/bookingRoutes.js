const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createBooking,
  getMyBookings
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/admin", protect, adminOnly, async (req, res) => {
  const snapshot = await db.collection("bookings").get()

  const bookings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))

  res.json(bookings)
})

router.delete("/:id", protect, async (req, res) => {
  const doc = await db.collection("bookings").doc(req.params.id).get()

  if (!doc.exists)
    return res.status(404).json({ message: "Not found" })

  const booking = doc.data()

  if (booking.userId !== req.user.uid)
    return res.status(403).json({ message: "Not allowed" })

  await db.collection("bookings").doc(req.params.id).delete()

  res.json({ message: "Booking cancelled" })
})

module.exports = router;