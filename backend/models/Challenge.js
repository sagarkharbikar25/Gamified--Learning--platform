const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  title: String,
  description: String,
  points: Number
});

module.exports = mongoose.model("Challenge", challengeSchema);