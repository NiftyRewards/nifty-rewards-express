const mongoose = require("mongoose");

const NFTMetadata = new mongoose.Schema({
  contractAddress: { type: String, required: true },
  chain: { type: String, required: true },
  balances: { type: [String], required: true },
  metadata: { type: [Object], required: true },
});

const AddressWithChain = new mongoose.Schema({
  address: { type: String, required: true },
  chain: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  address: { type: String, required: true },
  bounded_addresses: { type: [AddressWithChain], required: true },
  account_type: { type: String, default: "basic" },
  nfts_cache: { type: [NFTMetadata] },
});

module.exports = mongoose.model("User", userSchema);
