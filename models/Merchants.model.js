const mongoose = require("mongoose");

const merchantsSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model("Merchant", merchantsSchema);
