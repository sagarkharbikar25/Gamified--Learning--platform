const mongoose = require("mongoose");
 
const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // emoji or URL
  category: { type: String, enum: ["academic", "streak", "social", "special", "game"], default: "academic" },
  xpRequired: { type: Number, default: 0 },
  condition: { type: String }, // description of how to earn
  rarity: { type: String, enum: ["common", "rare", "epic", "legendary"], default: "common" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
 
module.exports = mongoose.model("Badge", badgeSchema);
 
