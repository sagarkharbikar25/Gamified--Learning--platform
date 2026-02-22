const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
  proof: String,
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Submission", submissionSchema);