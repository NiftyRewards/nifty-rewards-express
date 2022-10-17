const mongoose = require("mongoose");

/**
 * Reward
 * @typedef {object} Reward
 * @property {string} campaignId.required - Campaign Id the reward belongs to
 * @property {string} title - Chain Id where the collection exists
 * @property {number} remaining - Quantity of the reward left
 * @property {number} totalCoupon - Quantity of the reward used
 */

/**
 * Reward
 * @typedef {object} RewardWithCode
 * @property {string} campaignId.required - Campaign Id the reward belongs to
 * @property {string} title - Title of the reward
 * @property {string} code - Code Redeemed
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

/**
 * Has Redeemed Response
 * @typedef {object} HasRedeemedResponse
 * @property {boolean} hasClaimed.required - If reward was claimed
 * @property {string} message.required - Message of the response
 */

const rewardsSchema = new mongoose.Schema({
  // merchant_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, required: true },
  offer: { type: String, required: true },
  // collectionIdentifier: { type: String, required: true },
  // collectionAddress: { type: String, required: true },
  // chain: { type: String, required: true },
  // tokenId: { type: Number, required: true },
  availableCodes: { type: [String] },
  // start_date: { type: Date, required: true },
  // end_date: { type: Date, required: true },
});

module.exports = mongoose.model("Reward", rewardsSchema);
