const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  address: { type: String, required: true },
  bounded_addresses: { type: [String], required: true },
  account_type: { type: String, default: "basic" },
});

module.exports = mongoose.model("User", userSchema);
