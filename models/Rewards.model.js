const mongoose = require("mongoose");

const rewardsSchema = new mongoose.Schema({
  // merchant_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  campaign_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  collectionIdentifier: { type: String, required: true },
  collection_address: { type: String, required: true },
  chain: { type: String, required: true },
  token_id: { type: Number, required: true },
  quantity: { type: Number, required: true },
  quantity_used: { type: Number, default: 0 },
  // start_date: { type: Date, required: true },
  // end_date: { type: Date, required: true },
});

module.exports = mongoose.model("Reward", rewardsSchema);
