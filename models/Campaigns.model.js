const mongoose = require("mongoose");
const Rewards = require("./Rewards.model");

/**
 * Campaign
 * @typedef {object} Campaign
 * @property {string} _id.required - Unique Id of the campaign
 * @property {string} merchantId.required - Unique Id of the merchant
 * @property {array<string>} collectionIdentifiers.required - Collection Identifier (chainId-collectionAddress)
 * @property {string} title.required - Title of the campaign
 * @property {string} company.required - Company of the campaign
 * @property {string} companyLogoUrl.required - Logo URL of the campaign
 * @property {string} location.required - Location of the campaign
 * @property {string} website.required - Website of the campaign
 * @property {string} offers.required - Offers of the campaign
 * @property {[string]} tnc.required - Description of the campaign
 * @property {string} description.required - Description of the campaign
 * @property {string} startDate.required - UNIX timestamp of the start of the campaign
 * @property {string} endDate.required - UNIX timestamp of the end of the campaign
 * @property {string} paused.required - UPaused state of the campaign
 * @property {string} quantityLeft.required - Status of the campaign
 * @property {string} redeemed.required - Status of the campaign
 */

/**
 * Campaign Start Payload
 * @typedef {object} CampaignStartPayload
 * @property {string} merchantAddress.required - Address of the Merchant
 * @property {array<string>} collectionAddress.required - Address of the Collections
 * @property {array<string>} chain.required - Chain Ids of the Collections
 * @property {string} title.required - Title of Campaign
 * @property {string} description.required - Description of Campaign
 * @property {string} startDate.required - Start Date of Campaign
 * @property {string} endDate.required - End Date of Campaign
 * @property {array<string>} affectedTokens - Token Ids eligible for campaign
 * @property {string} redemptionCount - Number of times a reward can be redeemed
 */

/**
 * Campaign Start Response
 * @typedef {object} CampaignStartResponse
 * @property {string} message.required - Response Message
 * @property {array<Campaign>} data.required - Campaign Details
 */

/**
 * Campaign Eligible Response
 * @typedef {object} CampaignEligibleResponse
 * @property {string} message.required - Response Message
 * @property {array<Campaign>} data.required - Campaign Details
 */

/**
 * Campaign Merchant Summary
 * @typedef {object} CampaignMerchantSummary
 * @property {string} campaignId.required - Id of the campaign
 * @property {string} title.required - Name of the campaign
 * @property {string} status.required - Status of the campaign (active, inactive, completed)
 * @property {string} total.required - Total Rewards available for the campaign
 * @property {string} claimed.required - Total Rewards claimed already for the campaign
 * @property {string} startDate.required - UNIX timestamp of the start of the campaign
 * @property {string} endDate.required - UNIX timestamp of the end of the campaign
 */

/**
 * Campaign Merchant Summary Response
 * @typedef {object} CampaignMerchantSummaryResponse
 * @property {string} message.required - Message of the response
 * @property {array<CampaignMerchantSummary>} data.required - List of Campaign Merchant Summary
 */

/**
 * Campaign Pause Payload
 * @typedef {object} CampaignPausePayload
 * @property {bool} campaignId.required - Id of the Campaign
 */

/**
 * Campaign Pause Response
 * @typedef {object} CampaignPauseResponse
 * @property {string} message.required - Message of the response
 */

/**
 * Campaign Unpause Payload
 * @typedef {object} CampaignUnpausePayload
 * @property {string} campaignId.required - Id of the Campaign
 */

/**
 * Campaign Unpause Response
 * @typedef {object} CampaignUnpauseResponse
 * @property {string} message.required - Message of the response
 */

const campaignsSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  merchantAddress: { type: String, required: true },
  collectionIdentifiers: { type: [String], required: true },
  title: { type: String, required: true },
  header: { type: String, required: true },
  brandDescription: { type: String, required: true },
  backdropUrl: { type: String, required: true },
  company: { type: String, required: true },
  companyLogoUrl: { type: String, required: true },
  offer: { type: String, required: true },
  bgUrl: { type: String, required: true },
  location: { type: String, required: true },
  website: { type: String, required: true },
  tnc: { type: [String], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ["paused", "active", "pending"],
    default: "pending",
  },
  totalCoupon: { type: Number, required: true },
  remaining: { type: Number },
  claimedAddresses: { type: [String], default: [] },

  // rewards: { type: [Rewards.schema], required: true },
});

module.exports = mongoose.model("Campaign", campaignsSchema);
