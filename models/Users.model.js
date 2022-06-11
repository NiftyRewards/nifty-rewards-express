const mongoose = require("mongoose");

const NFTMetadata = new mongoose.Schema({
  contractAddress: { type: String, required: true },
  contractIdentifier: { type: String, required: true },
  chain: { type: String, required: true },
  balances: { type: [String], required: true },
  metadata: { type: [Object], required: true },
});

/**
 * User
 * @typedef {object} AddressWithChain
 * @property {string} address.required - Wallet address of the user
 * @property {string} chain.required - Chain Id of Address
 */
const AddressWithChain = new mongoose.Schema({
  address: { type: String, required: true },
  chain: { type: String, required: true },
});

/**
 * User
 * @typedef {object} User
 * @property {string} address.required - Wallet address of the user
 * @property {[AddressWithChain]} boundedAddresses.required - Bounded Addresses to the user
 * @property {string} accountType.required - Account type of the user
 * @property {[Object]} nftsCache - Cache of the user's owned NFTs
 * @property {string} cacheLastUpdated - UNIX Timestamp of the last time the cache was updated
 */
const userSchema = new mongoose.Schema({
  address: { type: String, required: true },
  boundedAddresses: { type: [AddressWithChain], required: true },
  accountType: { type: String, default: "basic" },
  nftsCache: { type: [NFTMetadata] },
  cacheLastUpdated: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
