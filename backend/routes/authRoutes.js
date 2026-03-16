const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();

router.post("/register", async (req, res) => {
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

router.put("/update", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { name, phone } = req.body;

    // Update Firebase Auth display name
    if (name) {
      await admin.auth().updateUser(uid, { displayName: name });
    }

    // Update Firestore record
    await admin.firestore().collection("users").doc(uid).set(
      {
        ...(name && { name }),
        ...(phone !== undefined && { phone: String(phone) }),
      },
      { merge: true }
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Delete all bookings belonging to this user
    const bookingsRef = admin.firestore().collection("bookings");
    const userBookings = await bookingsRef.where("userId", "==", uid).get();
    const deleteBatch = admin.firestore().batch();
    userBookings.forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();

    // Delete Firestore user document
    await admin.firestore().collection("users").doc(uid).delete();

    // Delete Firebase Auth user
    await admin.auth().deleteUser(uid);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;