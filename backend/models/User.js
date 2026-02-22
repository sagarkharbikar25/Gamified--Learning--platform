{
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ["student", "admin"], default: "student" },

  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  level: { type: Number, default: 1 },

  badges: [String],
  createdAt: { type: Date, default: Date.now }
}