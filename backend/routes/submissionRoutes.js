const express = require("express");
const Submission = require("../models/Submission");
const User = require("../models/User");

const router = express.Router();

// Submit proof
router.post("/", async (req, res) => {
  const submission = await Submission.create(req.body);
  res.json(submission);
});

// Approve submission
router.put("/approve/:id", async (req, res) => {
  const submission = await Submission.findById(req.params.id).populate("challenge user");

  submission.status = "approved";
  await submission.save();

  submission.user.points += submission.challenge.points;
  await submission.user.save();

  res.json({ msg: "Approved & points added" });
});

module.exports = router;