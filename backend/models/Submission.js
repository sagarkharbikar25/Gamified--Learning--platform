{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },

  proofUrl: String,
  proofText: String,

  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

  submittedAt: { type: Date, default: Date.now }
}