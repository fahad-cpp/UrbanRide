const { db } = require("../config/firebase");

exports.createUserProfile = async (req, res) => {
  const { uid, name, email } = req.body;

  await db.collection("users").doc(uid).set({
    name,
    email,
    createdAt: new Date(),
  });

  res.json({ message: "User profile created" });
};