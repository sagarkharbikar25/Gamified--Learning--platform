const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find().sort({ points: -1 });
  res.json(users);
});

module.exports = router;