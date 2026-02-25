const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  getVehicles,
  getVehicleById,
  createVehicle
} = require("../controllers/vehicleController");

const router = express.Router();

router.get("/", getVehicles);
router.get("/:id", getVehicleById);
router.post("/", protect, adminOnly, createVehicle);
router.delete("/:id", protect, adminOnly, async (req, res) => {
  await db.collection("vehicles").doc(req.params.id).delete()
  res.json({ message: "Deleted" })
})

module.exports = router;