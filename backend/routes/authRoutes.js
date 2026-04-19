const express = require("express");
const admin = require("firebase-admin");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendAccountDeletionEmail,
} = require("../utils/emailService");

const router = express.Router();

// POST /api/auth/register
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
      { phone: String(phone), createdAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    // Send verification email (non-fatal)
    try {
      const firebaseUser = await admin.auth().getUser(uidFromToken);
      const verificationLink = await admin.auth().generateEmailVerificationLink(firebaseUser.email);
      await sendVerificationEmail(
        firebaseUser.email,
        firebaseUser.displayName || "there",
        verificationLink
      );
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr.message);
    }

    res.status(200).json({ message: "User profile stored successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/welcome  — called after email is verified
router.post("/welcome", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (!decodedToken.email_verified) {
      return res.status(403).json({ message: "Email not verified yet" });
    }

    const firebaseUser = await admin.auth().getUser(decodedToken.uid);
    await sendWelcomeEmail(firebaseUser.email, firebaseUser.displayName || "there");

    res.status(200).json({ message: "Welcome email sent" });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/phone
router.post("/phone", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: "UID required" });

    const doc = await admin.firestore().collection("users").doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ phone: doc.data().phone || null });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/auth/update
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

    if (name) await admin.auth().updateUser(uid, { displayName: name });

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

// DELETE /api/auth/delete
router.delete("/delete", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Capture user info before deletion
    const firebaseUser = await admin.auth().getUser(uid);
    const userEmail = firebaseUser.email;
    const userName = firebaseUser.displayName || "there";

    // Delete all bookings
    const bookingsRef = admin.firestore().collection("bookings");
    const userBookings = await bookingsRef.where("userId", "==", uid).get();
    const deleteBatch = admin.firestore().batch();
    userBookings.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();

    // Delete Firestore user doc
    await admin.firestore().collection("users").doc(uid).delete();

    // Delete Firebase Auth user
    await admin.auth().deleteUser(uid);

    // Send farewell email (non-fatal)
    try {
      await sendAccountDeletionEmail(userEmail, userName);
    } catch (emailErr) {
      console.error("Deletion email failed:", emailErr.message);
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
