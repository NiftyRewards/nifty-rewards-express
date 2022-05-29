const ethers = require("ethers");

const User = require("../models/Users.model");
const Reward = require("../models/Rewards.model");
const Campaign = require("../models/Campaigns.model");
exports.getRewards = async (req, res, next) => {
  let { address, campaign_id } = req.query;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch {
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Find Rewards with campaign_id and address
  let rewards = await Reward.find({
    campaign_id: campaign_id,
    collection_address: address,
  });
};
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
    campaign_id: campaignId,
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

  let campaign = await Campaign.findOne({ _id: reward.campaign_id });
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
