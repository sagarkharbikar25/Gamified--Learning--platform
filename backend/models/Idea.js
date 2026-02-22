{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  title: String,
  description: String,

  upvotes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],

  createdAt: { type: Date, default: Date.now }
}