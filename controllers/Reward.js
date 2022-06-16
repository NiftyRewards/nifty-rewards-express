const ethers = require("ethers");

const User = require("../models/Users.model");
const Reward = require("../models/Rewards.model");
const Campaign = require("../models/Campaigns.model");

/**
 * GET /api/v1/rewards
 * @summary Get available rewards based on user and campaign Id
 * @description Get available rewards based on user and campaign Id
 * @tags Rewards
 * @param {string} address.required - Address of the account
 * @param {string} campaignId.required - Campaign Id to get rewards from
 * @return {object} 200 - Success Response - application/json
 * @example response - 200 - Successful Refresh of Cache
 * {
 *   "message": "NFTS Refreshed"
 * }
 * @return {object} 400 - Bad request response
 * @example response - 400 - Invalid Address
 * {
 *   "message": "Invalid address"
 * }
 * @example response - 400 - Invalid User
 * {
 *   "message": "User not found"
 * }
 */
exports.getRewards = async (req, res, next) => {
  let { address, campaignId } = req.query;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Find Rewards with campaignId and address
  let rewards = await Reward.find({
    campaignId: campaignId,
    collection_address: address,
  });

  return res.status(200).json({
    message: "Rewards retrieved",
    rewards
  });
};

/**
 * PUT /api/v1/redeem
 * @summary Redeem reward
 * @description Redeem reward specified by campaign Id and token Id, that belongs to userAddress
 * @tags Rewards
 * @param {string} address.required - Address of the user account
 * @param {string} campaignId.required - Campaign Id to redeem rewards from
 * @param {string} campaignId.required - NFT Token Id
 * @return {object} 200 - Success Response - application/json
 * @example response - 200 - Successful Redemption of reward
 * {
 *   "message": "Reward redeemed"
 * }
 * @return {object} 400 - Bad request response
 * @example response - 400 - Invalid userAddress
 * {
 *   "message": "Invalid address"
 * }
 * @example response - 400 - Invalid Reward
 * {
 *   "message": "Reward not found"
 * }
 * @example response - 400 - Reward Fully Redeemed
 * {
 *   "message": "Reward already fully redeemed"
 * }
 * @example response - 400 - Reward Not Started
 * {
 *   "message": "Reward not started"
 * }
 * @example response - 400 - Reward Expired
 * {
 *   "message": "Reward expired"
 * }
 * @example response - 400 - User does not own reward
 * {
 *   "message": "User does not own reward"
 * }
 *
 */
exports.redeemReward = async (req, res, next) => {
  let { userAddress, campaignId, tokenId } = req.body;
  console.log("🚀 | exports.redeemReward= | userAddress", userAddress);

  // Check if valid address
  try {
    userAddress = ethers.utils.getAddress(userAddress);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Find Reward with reward_id and address
  let reward = await Reward.findOne({
    campaignId: campaignId,
    token_id: tokenId,
  });
  console.log(
    "🚀 | exports.redeemReward= | reward",
    String(reward.collectionIdentifier).toLowerCase()
  );

  // Check if reward exists
  if (!reward) {
    return res.status(400).json({
      message: "Reward not found",
    });
  }

  // Check if reward is already redeemed
  if (reward.quantity === 0) {
    return res.status(400).json({
      message: "Reward already fully redeemed",
    });
  }

  let campaign = await Campaign.findOne({ _id: reward.campaignId });
  console.log("🚀 | exports.redeemReward= | campaign", campaign.start_date);
  console.log("🚀 | exports.redeemReward= | campaign", campaign.end_date);

  // Check if reward is started
  if (Date.now() < campaign.start_date) {
    return res.status(400).json({
      message: "Reward not started",
    });
  }

  // Check if reward is expired
  if (campaign.end_date < Date.now()) {
    return res.status(400).json({
      message: "Reward expired",
    });
  }

  // Check if user is the owner of the reward
  let user_cache = await User.findOne(
    {
      address: userAddress,
      "nfts_cache.contractIdentifier": {
        $eq: String(reward.collectionIdentifier).toLowerCase(),
      },
      "nfts_cache.balances": { $eq: tokenId },
    },
    {
      "nfts_cache.$": 1,
    }
  );
  console.log("🚀 | exports.redeemReward= | user_cache", user_cache);

  if (!user_cache) {
    return res.status(400).json({
      message: "User does not own reward",
    });
  }
  // Redeem reward
  reward.quantity -= 1;
  reward.quantity_used += 1;
  await reward.save();

  return res.status(200).json({
    message: "Reward redeemed",
  });
};
