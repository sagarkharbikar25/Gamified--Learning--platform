const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "teacher", "school"],
      required: true,
    },

    firstName: String,
    lastName: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: String,

    password: {
      type: String,
      required: true,
    },

    // Extra fields optional (can expand later)
    schoolName: String,
    grade: String,
    state: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);