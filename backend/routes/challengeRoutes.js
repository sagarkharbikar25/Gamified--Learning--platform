const express = require("express");
const Challenge = require("../models/Challenge");

const router = express.Router();

// Create challenge
router.post("/", async (req, res) => {
  const challenge = await Challenge.create(req.body);
  res.json(challenge);
});

// Get all challenges
router.get("/", async (req, res) => {
  const challenges = await Challenge.find();
  res.json(challenges);
});

module.exports = router;