const { db } = require("../config/firebase");

exports.createBooking = async (req, res) => {
  const { vehicleId, startDate, endDate } = req.body;

  const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
  if (!vehicleDoc.exists)
    return res.status(404).json({ message: "Vehicle not found" });

  const vehicle = vehicleDoc.data();

  const days =
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

  const totalPrice = days * vehicle.pricePerDay;

  const booking = await db.collection("bookings").add({
    userId: req.user.uid,
    vehicleId,
    startDate,
    endDate,
    totalPrice,
    status: "confirmed",
    createdAt: new Date(),
  });

  res.json({ id: booking.id });
};

exports.getMyBookings = async (req, res) => {
  const snapshot = await db
    .collection("bookings")
    .where("userId", "==", req.user.uid)
    .get();

  const bookings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.json(bookings);
};