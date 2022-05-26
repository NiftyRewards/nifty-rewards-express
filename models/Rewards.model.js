const mongoose = require("mongoose");

const rewardsSchema = new mongoose.Schema({
  merchant_id: { type: ObjectId, required: true },
  collection_address: { type: String, required: true },
  token_id: { type: Number, required: true },
  description: { type: Number, required: true },
  quantity: { type: Number, required: true },
  quantity_used: { type: Number, required: true },
});

module.exports = mongoose.model("Reward", rewardsSchema);
