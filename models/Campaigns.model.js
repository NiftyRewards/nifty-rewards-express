const mongoose = require("mongoose");

const campaignsSchema = new mongoose.Schema({
  merchant_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  collection_address: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
});

module.exports = mongoose.model("Campaign", campaignsSchema);
