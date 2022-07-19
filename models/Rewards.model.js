const mongoose = require("mongoose");

/**
 * Reward
 * @typedef {object} Reward
 * @property {string} campaignId.required - Campaign Id the reward belongs to
 * @property {string} collectionIdentifier.required - Collection Identifier (chainId-collectionAddress)
 * @property {string} collectionAddress.required - Contract address of the collection
 * @property {string} chain - Chain Id where the collection exists
 * @property {number} tokenId - Token Id of the reward
 * @property {number} quantity - Quantity of the reward left
 * @property {number} quantityUsed - Quantity of the reward used
 */

/**
 * Reward Response
 * @typedef {object} RewardResponse
 * @property {string} message.required - Message of the response
 * @property {[Reward]} data.required - Rewards Data
 */

/**
 * Reward Redeemed Response
 * @typedef {object} RewardRedeemedResponse
 * @property {string} message.required - Message of the response
 */

const rewardsSchema = new mongoose.Schema({
  // merchant_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, required: true },
  collectionIdentifier: { type: String, required: true },
  collectionAddress: { type: String, required: true },
  chain: { type: String, required: true },
  tokenId: { type: Number, required: true },
  quantity: { type: Number, required: true },
  quantityUsed: { type: Number, default: 0 },
  // start_date: { type: Date, required: true },
  // end_date: { type: Date, required: true },
});

module.exports = mongoose.model("Reward", rewardsSchema);
