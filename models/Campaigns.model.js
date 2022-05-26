const mongoose = require("mongoose");

const campaignsSchema = new mongoose.Schema({
  merchant_id: { type: ObjectId, required: true },
  collection_address: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
});

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", campaignsSchema);
export default Campaign;
