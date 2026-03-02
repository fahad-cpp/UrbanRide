const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();

router.post("/register", async (req, res) => {
  console.log("REGISTER ROUTE HIT")
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);
    const uidFromToken = decodedToken.uid;

    const { id, phone } = req.body;

    if (id !== uidFromToken) {
      return res.status(403).json({ message: "Unauthorized UID mismatch" });
    }

    await admin.firestore().collection("users").doc(uidFromToken).set(
      {
        phone: String(phone),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true } 
    );

    res.status(200).json({ message: "User profile stored successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
});


router.post("/phone", async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "UID required" });
    }

    const doc = await admin.firestore()
      .collection("users")
      .doc(uid)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      phone: doc.data().phone || null
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;