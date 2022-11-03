const Campaign = require("../models/Campaigns.model");
const Merchant = require("../models/Merchants.model");
const Reward = require("../models/Rewards.model");
const User = require("../models/Users.model");
const Collection = require("../models/Collections.model");
const axios = require("axios");
const ethers = require("ethers");
const { chains } = require("../utils/chains");
const randomstring = require("randomstring");
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
 * @description Start a new campaign. When a Campaign is started rewards are generated as well
 * @param {CampaignStartPayload} request.body.required
 * @example request - CampaignStartPayload
 * {
 *  "merchantAddress": "0xc1C9D88A4E58B5E395675ded16960Ffca265bA52",
 *  "collectionAddresses": ["0x165a2eD732eb15B54b5E8C057CbcE6251370D6e8","0x75E9Abc7E69fc46177d2F3538C0B92d89054eC91"],
 *  "chainIds": ["1","1"],
 *  "title": "NIKE CAMPAIGN",
 *  "company": "Atmos",
 *  "description": "10% off when you purchase any footwear on nike.com!",
 *  "location": "nike.com",
 *  "website": "www.nike.com",
 *  "logoUrl": "https://www.nike.com/logo.png",
 *  "bgUrl": "https://www.nike.com/bg.png",
 *  "offer": '10% Off footwear',
 *  "tnc": ['Limited to 1 redemption per user. Limited redemptions available for the period','Promo is valid from now until 30th June 2022 or redemption lasts, whichever is sooner','Applicable only for in-store purchases','Other Nike T&Cs apply'],
 *  "startDate": "2020-01-01",
 *  "endDate": "2020-08-01",
 *  "redemptionCount": "500"
 * }
 * @return {CampaignStartResponse} 200 - success response - application/json
 * @return {DefaultErrorResponse} 400 - Bad request response
 */
exports.startCampaign = async (req, res, next) => {
  let {
    merchantAddress,
    collectionAddresses,
    chainIds,
    title,
    company,
    companyLogoUrl,
    offer,
    bgUrl,
    location,
    website,
    description,
    tnc,
    startDate,
    endDate,
    affectedTokens,
    redemptionCount,
    brandDescription,
    header,
    backdropUrl,
  } = req.body;

  if (!redemptionCount) {
    redemptionCount = 1;
  }

  // Check if valid address
  try {
    merchantAddress = ethers.utils.getAddress(merchantAddress);

    collectionAddresses = collectionAddresses.map((address) =>
      ethers.utils.getAddress(address)
    );
  } catch (error) {
    return res.status(400).json({
      error: "Invalid address",
    });
  }

  // Check if Merchant is Verified
  let merchant = await Merchant.findOne({
    merchant_address: merchantAddress,
  });
  if (!merchant || !merchant.verified) {
    return res.status(400).json({
      error: "Merchant not verified",
    });
  }
  // Check if collection exists
  let collectionIdentifiers = [];
  for (let i = 0; i < collectionAddresses.length; i++) {
    collectionIdentifiers.push(`${chainIds[i]}-${collectionAddresses[i]}`);
    // let collection = await Collection.findOne({
    //   collectionIdentifier: collectionIdentifier,
    // });
    // if (!collection) {
    //   return res.status(400).json({
    //     error: "Collection not found",
    //   });
    // }
  }
  // Create Campaign
  let campaign;
  try {
    campaign = await Campaign.create({
      merchantId: merchant._id,
      merchantAddress: merchantAddress,
      collectionIdentifiers: collectionIdentifiers,
      title: title,
      company: company,
      companyLogoUrl: companyLogoUrl,
      brandDescription: brandDescription,
      header: header,
      backdropUrl: backdropUrl,
      offer: offer,
      bgUrl: bgUrl,
      location: location,
      website: website,
      description: description,
      tnc: tnc,
      startDate: startDate,
      endDate: endDate,
      status: "active",
      totalCoupon: redemptionCount,
      remaining: redemptionCount,
    });

    // Add Campaign to Merchant
    await Merchant.findByIdAndUpdate(merchant._id, {
      $push: { campaigns: campaign._id },
    });
  } catch (err) {
    console.log("🚀 | exports.startCampaign= | err", err);
    return res.status(400).json({
      error: "Error Creating Campaign",
    });
  }

  // No longer create rewards for individual tokens (FCFS)
  // Create Rewards (Multiple)
  let codes = [];
  // Only Create 1 Code for now
  for (let i = 0; i < 1; i++) {
    codes.push(randomstring.generate(6));
  }
  try {
    //   let tokenIds;
    //   // Generate Rewards
    //   // Rewards Apply to all tokens in the collection
    //   if (affectedTokens === "all" || !affectedTokens) {
    //     // Get list of token ids in collection
    //     tokenIds = collection.cache.map((token) => {
    //       return token.tokenId;
    //     });
    //   } else {
    //     tokenIds = affectedTokens;
    //   }

    //   tokenIds = tokenIds.map((tokenId) => {
    //     return {
    //       campaignId: campaign._id,
    //       collectionIdentifier: collectionIdentifier,
    //       collectionAddress: collectionAddress,
    //       chain: chainId,
    //       tokenId: tokenId,
    //       quantity: redemptionCount,
    //     };
    //   });

    let rewards = await Reward.create({
      campaignId: campaign._id,
      offer: offer,
      availableCodes: codes,
    });
  } catch (error) {
    console.log("🚀 | exports.startCampaign= | error", error);
    return res.status(400).json({
      message: "Invalid reward data",
      error: error,
    });
  }

  return res.status(200).json({
    message: "Campaign started",
    data: {
      id: campaign._id,
      merchantId: campaign.merchantId,
      collectionIdentifiers: campaign.collectionIdentifiers,
      title: campaign.title,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    },
  });
};

/**
 * PUT /api/v1/campaign/edit
 * @summary Edit an existing campaign
 * @tags Campaign
 * @description Edit an existing campaign
 * @return {DefaultErrorResponse} 501 - Not Implemented
 */
exports.editCampaign = async (req, res, next) => {
  return res.status(501).json({
    message: "Not Implemented",
  });
};

/**
 * PUT /api/v1/campaign/approve
 * @summary Approve an existing campaign
 * @tags Campaign
 * @description Approve an existing campaign
 * @return {DefaultErrorResponse} 501 - Not Implemented
 */
exports.approveCampaign = async (req, res, next) => {
  return res.status(501).json({
    error: "Not Implemented",
  });
};

/**
 * GET /api/v1/campaign/eligible
 * @summary Get campaigns eligible for a user
 * @tags Campaign
 * @description Get Eligible Campaigns based on user's address (e.g. 0xA63dDdB69E6e470Bf3d236B434EF80a213B998A7)
 * @param {string} address.query.required - Address of the User
 * @return {CampaignEligibleResponse} 200 - success response - application/json
 * @return {DefaultErrorResponse} 400 - Bad request response
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
 * @return {CampaignEligibleResponse} 200 - success response - application/json
 * @return {DefaultErrorResponse} 400 - Bad request response
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

  // // Aggregate rewards left
  // let quantity = 0;
  // try {
  //   console.log(
  //     await Reward.aggregate([
  //       { $match: { campaignId: campaignId } },
  //       { $group: { _id: null, quantity: { $sum: "$quantity" } } },
  //     ])
  //   );
  // } catch (error) {
  //   console.log("🚀 | exports.getCampaign= | error", error);
  //   return res.status(400).json({
  //     message: "Invalid Request",
  //     error: error,
  //   });
  // }

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
 * @return {CampaignMerchantSummaryResponse} 200 - Success response - application/json
 * @return {DefaultErrorResponse} 400 - Bad request response
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

/**
 * PUT /api/v1/campaign/pause
 * @summary Pause a Campaign
 * @tags Campaign
 * @description Set campaign's status to paused
 * @param {CampaignPausePayload} request.body.required - Merchant address - (e.g. 0xc1C9D88A4E58B5E395675ded16960Ffca265bA52)
 * @return {CampaignPauseResponse} 200 - Success response - application/json
 * @return {DefaultErrorResponse} 400 - Bad request response
 */

exports.pauseCampaign = async (req, res, next) => {
  let { campaignId } = req.body;
  let campaign;

  try {
    campaign = await Campaign.findById(campaignId);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid Request",
      error: error,
    });
  }

  if (!campaign) {
    return res.status(400).json({
      message: "Campaign not found",
    });
  }

  campaign.status = "paused";
  await campaign.save();

  return res.status(200).json({
    message: "Campaign Paused",
    data: campaign,
  });
};
/**
 * PUT /api/v1/campaign/unpause
 * @summary Get campaigns by a merchant
 * @tags Campaign
 * @description Get merchant's campaigns to populate on the merchant dashboard
 * @param {CampaignUnpausePayload} request.body.required - Merchant address - (e.g. 0xc1C9D88A4E58B5E395675ded16960Ffca265bA52)
 * @return {CampaignUnpauseResponse} 200 - Success response - application/json
 * @return {DefaultErrorResponse} 400 - Bad request response
 */

exports.unpauseCampaign = async (req, res, next) => {
  let { campaignId } = req.body;
  let campaign;

  try {
    campaign = await Campaign.findById(campaignId);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid Request",
      error: error,
    });
  }

  if (!campaign) {
    return res.status(400).json({
      message: "Campaign not found",
    });
  }

  campaign.status = "active";
  await campaign.save();

  return res.status(200).json({
    message: "Campaign Unpaused",
    data: campaign,
  });
};
