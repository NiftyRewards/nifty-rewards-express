const mongoose = require("mongoose");

const NFTMetadata = new mongoose.Schema({
  contractAddress: { type: String, required: true },
  collectionIdentifier: { type: String, required: true },
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
 * User Bind Payload
 * @typedef {object} UserBindPayload
 * @property {string} address.required - Current Address
 * @property {string} addressToBind.required - Address to Bind
 * @property {string} chain.required - Chain Id
 * @property {string} message.required - Message to sign
 * @property {string} signature.required - Signature of the message
 */

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
  boundedAddresses: { type: [AddressWithChain] },
  accountType: { type: String, default: "basic" },
  nftsCache: { type: [NFTMetadata] },
  cacheLastUpdated: { type: Date },
  claimedRewards: { type: [mongoose.Schema.Types.ObjectId] },
});

module.exports = mongoose.model("User", userSchema);
