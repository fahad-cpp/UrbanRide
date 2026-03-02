const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await admin.auth().createUser({
      email,
      password,
    });

    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    res.status(201).json({
      uid: user.uid,
      email: user.email,
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});


router.post("/login", async (req, res) => {
  res.status(400).json({
    message: "Login must be handled on frontend using Firebase SDK.",
  });
});

module.exports = router;