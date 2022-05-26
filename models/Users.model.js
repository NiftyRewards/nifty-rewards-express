const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  address: { type: String, required: true },
  bounded_addresses: { type: [String], required: true },
  account_type: { type: String, default: "basic" },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
