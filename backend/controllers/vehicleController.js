const { db } = require("../config/firebase");

exports.getVehicles = async (req, res) => {
  const snapshot = await db.collection("vehicles").get();
  const vehicles = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  res.json(vehicles);
};

exports.getVehicleById = async (req, res) => {
  const doc = await db.collection("vehicles").doc(req.params.id).get();
  if (!doc.exists)
    return res.status(404).json({ message: "Not found" });

  res.json({ id: doc.id, ...doc.data() });
};

exports.createVehicle = async (req, res) => {
  const vehicle = await db.collection("vehicles").add({
    ...req.body,
    available: true,
    createdAt: new Date(),
  });

  res.json({ id: vehicle.id });
};