const mongoose = require("mongoose");
const Rewards = require("./Rewards.model");

/**
 * Campaign
 * @typedef {object} Campaign
 * @property {string} merchantId.required - Unique Id of the merchant
 * @property {string} collectionIdentifier.required - Collection Identifier (chainId-collectionAddress)
 * @property {string} title.required - Title of the campaign
 * @property {string} description.required - Description of the campaign
 * @property {string} startDate.required - UNIX timestamp of the start of the campaign
 * @property {string} endDate.required - UNIX timestamp of the end of the campaign
 */
const campaignsSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  collectionIdentifier: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  // rewards: { type: [Rewards.schema], required: true },
});

module.exports = mongoose.model("Campaign", campaignsSchema);
