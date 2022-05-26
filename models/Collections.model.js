const mongoose = require("mongoose");

const collectionsSchema = new mongoose.Schema({
  collection_address: { type: String, required: true },
  collection_name: { type: String, required: true },
});

module.exports = mongoose.model("Collection", collectionsSchema);
