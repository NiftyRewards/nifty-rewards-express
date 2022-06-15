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

/**
 * Campaign Start Payload
 * @typedef {object} CampaignStartPayload
 * @property {string} merchantAddress.required - Address of the Merchant
 * @property {string} collectionAddress.required - Address of the Collection
 * @property {string} chain.required - Chain Id
 * @property {string} title.required - Title of Campaign
 * @property {string} description.required - Description of Campaign
 * @property {string} startDate.required - Start Date of Campaign
 * @property {string} endDate.required - End Date of Campaign
 * @property {[string]} affectedTokens - Token Ids eligible for campaign
 * @property {string} redemptionCount - Number of times a reward can be redeemed
 */

/**
 * Campaign Merchant Response
 * @typedef {object} CampaignMerchantResponse
 * @property {string} name.required - Name of the campaign
 * @property {string} status.required - Status of the campaign (active, inactive, completed)
 * @property {string} total.required - Total Rewards available for the campaign
 * @property {string} claimed.required - Total Rewards claimed already for the campaign
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
