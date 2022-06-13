const Campaign = require("../models/Campaigns.model");
const Merchant = require("../models/Merchants.model");
const Collection = require("../models/Collections.model");
const Reward = require("../models/Rewards.model");
const axios = require("axios");
const ethers = require("ethers");
const { chains } = require("../utils/chains");
/**
 * @description Get List of collection identifiers
 * @param {*} nfts_cache
 * @returns List of collection identifiers
 */
function getCollectionIdentifiers(nfts_cache) {
  let collectionIdentifiers = nfts_cache.map((collection) => {
    return collection.collectionIdentifier;
  });
  return collectionIdentifiers;
}

/**
 * POST /api/v1/campaign/start
 * @summary Start a new campaign
 * @tags Campaign
 * @description Start a new campaign
 * when Campaign is started rewards are generated as well
 * @param {string} merchantAddress.required - Address of the Merchant
 * @param {string} collectionAddress.required - Address of the Collection
 * @param {string} chain.required - Chain Id
 * @param {string} title.required - Title of Campaign
 * @param {string} description.required - Description of Campaign
 * @param {string} startDate.required - Start Date of Campaign
 * @param {string} endDate.required - End Date of Campaign
 * @param {[string]} tokenIdsrequired - Token Ids eligible for campaign
 * @param {string} redemptionCount.required - Number of times a reward can be redeemed
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
exports.startCampaign = async (req, res, next) => {
  let {
    merchantAddress,
    collectionAddress,
    chainId,
    title,
    description,
    startDate,
    endDate,
    affectedTokens,
    redemptionCount,
  } = req.body;

  // Check if valid address
  try {
    merchantAddress = ethers.utils.getAddress(merchantAddress);
    collectionAddress = ethers.utils.getAddress(collectionAddress);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Check if Merchant is Verified
  let merchant = await Merchant.findOne({
    merchant_address: merchantAddress,
  });
  if (!merchant || !merchant.verified) {
    return res.status(400).json({
      message: "Merchant not verified",
    });
  }
  // Check if collection exists
  let collectionIdentifier = `${chainId}-${collectionAddress}`;
  let collection = await Collection.findOne({
    collectionIdentifier: collectionIdentifier,
  });
  if (!collection) {
    return res.status(400).json({
      message: "Collection not found",
    });
  }

  // Create Campaign
  let campaign;
  try {
    campaign = await Campaign.create({
      merchant_id: merchant._id,
      collectionIdentifier: collection.collectionIdentifier,
      title: title,
      description: description,
      start_date: startDate,
      end_date: endDate,
    });

    // Add Campaign to Merchant
    await Merchant.findByIdAndUpdate(merchant._id, {
      $push: { campaigns: campaign._id },
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error Creating Campaign",
    });
  }

  // Create Rewards (Multiple)
  try {
    let tokenIds;
    // Generate Rewards
    // Rewards Apply to all tokens in the collection
    if (affectedTokens === "all" || !affectedTokens) {
      // Get list of token ids in collection
      tokenIds = collection.cache.map((token) => {
        return token.tokenId;
      });
    } else {
      tokenIds = affectedTokens;
    }

    tokenIds = tokenIds.map((tokenId) => {
      return {
        campaign_id: campaign._id,
        collectionIdentifier: collectionIdentifier,
        collection_address: collectionAddress,
        chain: chainId,
        token_id: tokenId,
        quantity: redemptionCount,
      };
    });

    let rewards = await Reward.create(tokenIds);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid reward data",
      error: error,
    });
  }

  return res.status(200).json({
    message: "Campaign started",
  });
};

/**
 * PUT /api/v1/campaign/edit
 * @summary Edit an existing campaign
 * @tags Campaign
 * @description Edit an existing campaign
 * @return {object} 501 - Not Implemented
 */
exports.editCampaign = async (req, res, next) => {
  return res.status(501).json({
    message: "Not Implemented",
  });
};
// exports.getCampaign = async (req, res, next) => {
//   return res.status(501).json({
//     message: "Not Implemented",
//   });
// };
exports.approveCampaign = async (req, res, next) => {
  return res.status(501).json({
    message: "Not Implemented",
  });
};

/**
 * GET /api/v1/campaign/merchant
 * @summary Get campaigns by a merchant
 * @description Get all Campaigns started by a merchant
 * @param {string} address.query.required - Address of the Merchant
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
exports.getEligibleCampaigns = async (req, res, next) => {
  let { address } = req.query;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Get merchantId
  let merchant = await Merchant.findOne({ address: address });
  let merchantId = merchant._id;

  // Get Campaigns filtered by filtered_nfts_cache
  let campaigns = await Campaign.find({ merchantId: merchantId }, { __v: 0 });

  if (!campaigns) {
    return res.status(200).json({
      message: "No Campaigns By Merchant",
      data: {},
    });
  }

  return res.status(200).json({
    message: "Eligible Campaigns Retrieved",
    data: campaigns,
  });
};

/**
 * GET /api/v1/campaign/eligible
 * @summary Get campaigns eligible for a user
 * @description Get Eligible Campaigns based on user's address
 * @param {string} address.query.required - Address of the User
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
exports.getEligibleCampaigns = async (req, res, next) => {
  let { address } = req.query;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Get user
  let user = await User.findOne({ address: address });
  let nfts_cache = user.nfts_cache;
  let filtered_nfts_cache = getCollectionIdentifiers(nfts_cache);

  // Get Rewards filtered by filtered_nfts_cache
  let campaigns = await Campaign.find(
    {
      collectionIdentifier: { $all: filtered_nfts_cache },
    },
    { __v: 0 }
  );

  if (!campaigns) {
    return res.status(200).json({
      message: "No Eligible Campaigns",
      data: {},
    });
  }

  return res.status(200).json({
    message: "Eligible Campaigns Retrieved",
    data: campaigns,
  });
};

/**
 * GET /api/v1/campaign
 * @summary Get campaigns
 * @tags Campaign
 * @description Get campaign details. If no campaignId is given, retrieve all campaigns
 * @param {string} campaignId.query.required - Campaign Id
 * @return {object} 200 - success response - application/json
 * @return {object} 400 - Bad request response
 */
exports.getCampaign = async (req, res, next) => {
  let { campaignId } = req.query;
  let campaigns;

  try {
    if (campaignId) {
      campaigns = await Campaign.findById(campaignId, { __v: 0 });
    } else {
      campaigns = await Campaign.find({}, { __v: 0 });
    }
  } catch (error) {
    console.log("🚀 | exports.getCampaign= | error", error);
    return res.status(400).json({
      message: "Invalid Request",
      error: error,
    });
  }

  if (!campaigns) {
    return res.status(200).json({
      message: "No Campaigns",
      data: {},
    });
  }

  return res.status(200).json({
    message: "Campaigns Retrieved",
    data: campaigns,
  });
};
