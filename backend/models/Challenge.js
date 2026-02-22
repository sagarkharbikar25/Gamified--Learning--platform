{
  title: String,
  description: String,
  points: Number,
  deadline: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
