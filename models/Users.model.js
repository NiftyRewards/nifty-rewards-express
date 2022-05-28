const mongoose = require("mongoose");

const NFTMetadata = new mongoose.Schema({
  contractAddress: { type: String, required: true },
  contractIdentifier: { type: String, required: true },
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
  cache_last_updated: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
