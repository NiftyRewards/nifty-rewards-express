const mongoose = require("mongoose");
const Rewards = require("./Rewards.model");

const campaignsSchema = new mongoose.Schema({
  merchant_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  collectionIdentifier: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  // rewards: { type: [Rewards.schema], required: true },
});

module.exports = mongoose.model("Campaign", campaignsSchema);
