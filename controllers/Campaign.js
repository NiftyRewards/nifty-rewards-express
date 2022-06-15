const Campaign = require("../models/Campaigns.model");
const Merchant = require("../models/Merchants.model");
const User = require("../models/Users.model");
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
  // Split each collection into its own array at the - character

  let collectionIdentifiers = nfts_cache.map((collection) => {
    let ci = collection.collectionIdentifier.split("-");
    return ci[0] + "-" + ethers.utils.getAddress(ci[1]);
  });
  return collectionIdentifiers;
}

/**
 * POST /api/v1/campaign/start
 * @summary Start a new campaign
 * @tags Campaign
 * @description Start a new campaign
 * when Campaign is started rewards are generated as well
 * @param {CampaignStartPayload} request.body.required
 *  @example request - CampaignStartPayload
 * {
 *  "merchantAddress": "0xc1C9D88A4E58B5E395675ded16960Ffca265bA52",
 *  "collectionAddress": "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
 *  "chainId": "1",
 *  "title": "Campaign Title",
 *  "description": "Campaign Description",
 *  "startDate": "2020-01-01",
 *  "endDate": "2020-08-01",
 *  "redemptionCount": "1"
 * }
 * @example request - CampaignStartPayload with affectedTokens
 * {
 *  "merchantAddress": "0xc1C9D88A4E58B5E395675ded16960Ffca265bA52",
 *  "collectionAddress": "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
 *  "chainId": "1",
 *  "title": "Campaign Title",
 *  "description": "Campaign Description",
 *  "startDate": "2020-01-01",
 *  "endDate": "2020-08-01",
 *  "affectedTokens": [1, 2, 3, 4],
 *  "redemptionCount": "1"
 * }
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

  if (!redemptionCount) {
    redemptionCount = 1;
  }

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
      merchantId: merchant._id,
      collectionIdentifier: collection.collectionIdentifier,
      title: title,
      description: description,
      startDate: startDate,
      endDate: endDate,
    });

    // Add Campaign to Merchant
    await Merchant.findByIdAndUpdate(merchant._id, {
      $push: { campaigns: campaign._id },
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error Creating Campaign",
      error: err,
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
        campaignId: campaign._id,
        collectionIdentifier: collectionIdentifier,
        collectionAddress: collectionAddress,
        chain: chainId,
        tokenId: tokenId,
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
 * GET /api/v1/campaign/eligible
 * @summary Get campaigns eligible for a user
 * @tags Campaign
 * @description Get Eligible Campaigns based on user's address (e.g. 0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7)
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
  let nftsCache = user.nftsCache;
  let filteredNftsCache = getCollectionIdentifiers(nftsCache);
  console.log(
    "🚀 | exports.getEligibleCampaigns= | filteredNftsCache",
    filteredNftsCache
  );

  // Get Rewards filtered by filtered_nfts_cache
  let campaigns = await Campaign.find(
    {
      collectionIdentifier: filteredNftsCache,
    },
    { __v: 0 }
  );
  console.log("🚀 | exports.getEligibleCampaigns= | campaigns", campaigns);

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
 * @param {string} campaignId.query - Campaign Id
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

/**
 * GET /api/v1/campaign/merchant
 * @summary Get campaigns by a merchant
 * @tags Campaign
 * @description Get merchant's campaigns to populate on the merchant dashboard
 * @param {string} merchantAddress.query.required - Merchant address - (e.g. 0xc1C9D88A4E58B5E395675ded16960Ffca265bA52)
 * @return {CampaignMerchantResponse} 200 - Success response - application/json
 * @return {object} 400 - Bad request response
 */
exports.getMerchantCampaigns = async (req, res, next) => {
  let { merchantAddress } = req.query;
  let campaigns;

  // Get merchantId
  let merchant = await Merchant.findOne({ address: merchantAddress });
  console.log("🚀 | exports.getMerchantCampaigns= | merchant", merchant);

  if (!merchant) {
    return res.status(400).json({
      message: "Invalid Request",
      error: "Merchant not found",
    });
  }

  let merchantId = merchant._id;
  console.log("🚀 | exports.getMerchantCampaigns= | merchantId", merchantId);

  try {
    if (merchantId) {
      campaigns = await Campaign.find({ merchantId: merchantId }, { __v: 0 });
    } else {
      return res.status(400).json({
        message: "merchantAddress required",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Invalid Request",
      error: error,
    });
  }

  if (!campaigns) {
    return res.status(200).json({
      message: "No Campaigns",
      data: [],
    });
  }

  return res.status(200).json({
    message: "Campaigns Retrieved",
    data: campaigns,
  });
};
