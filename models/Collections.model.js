const mongoose = require("mongoose");

const collectionsSchema = new mongoose.Schema({
  collection_address: { type: String, required: true },
  chain: { type: String, required: true },
  collectionIdentifier: { type: String, required: true },
  campaigns: { type: [String], required: true },
  cache: { type: Object, required: true },
  totalSupply: { type: Number },
  cache_last_updated: { type: Date },
});

module.exports = mongoose.model("Collection", collectionsSchema);
