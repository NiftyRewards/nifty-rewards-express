const ethers = require("ethers");
const { chains } = require("../utils/chains");
const axios = require("axios");
const Users = require("../models/Users.model");
const Reward = require("../models/Rewards.model");
const Campaign = require("../models/Campaigns.model");

/**
 * @description Get NFTS from Tatum
 * @param {*} chain (ETH)
 * @param {*} address
 * @returns
 */
async function isHolder(chain, contractAddress, address) {
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  let resp;
  try {
    resp = await axios.get(
      `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/isHolderOfCollection`,

      { params: { wallet: address, contractAddress: contractAddress } }
    );
  } catch (e) {
    console.log(e);
  }
  return resp.data;
}

/**
 * GET /api/v1/reward
 * @summary Get available rewards based on user and campaign Id
 * @description Get available rewards based on user and campaign Id
 * @tags Rewards
 * @param {string} address.query.required - Address of the account
 * @param {string} campaignId.query.required - Campaign Id to get rewards from
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
    rewards,
  });
};

/**
 * PUT /api/v1/reward/redeem
 * @summary Redeem reward
 * @description Redeem reward specified by campaign Id that belongs to address, and returns a unique code
 * @tags Rewards
 * @param {RedeemRewardPayload} request.body.required
 * @return {RewardRedeemedResponse} 200 - Success Response - application/json
 * @example request - User with NFT
 * {
 *  "address": "0x5672C4871b615AA45B090a790646cfC8305beDdf",
 *  "campaignId": "63504aa76490bae392b255b7"
 * }
 * @example request - User without NFT
 * {
 *  "address": "0xE7B43e7cd453162E8c6f894b2a2Bc33d0521e3aa",
 *  "campaignId": "63504aa76490bae392b255b7"
 * }
 * @example response - 200 - Successful Redemption of reward
 * {
 *   "message": "Reward redeemed"
 * }
 * @return {DefaultErrorResponse} 400 - Bad request response
 * @example response - 400 - Invalid user
 * {
 *   "message": "Invalid address"
 * }
 * @example response - 400 - Invalid address
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
  let { address, campaignId } = req.body;
  console.log("🚀 | exports.redeemReward= | address", address);

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  // Check if user has nft
  let campaign = await Campaign.findOne({ _id: campaignId });
  let collectionIdentifiers;
  if (!campaign) {
    return res.status(400).json({
      message: "Campaign not found",
    });
  } else {
    collectionIdentifiers = campaign.collectionIdentifiers;
  }

  collectionIdentifiers = collectionIdentifiers.map((collection) => {
    return collection.split("-");
  });

  let hasNFT = false;

  let user = await Users.findOne({ address: address });
  console.log("🚀 | exports.redeemReward= | user", user);

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  let boundedAddresses = user.boundedAddresses.map(
    (address) => address.address
  );

  for (let collection of collectionIdentifiers) {
    for (let address of boundedAddresses) {
      let { isHolderOfCollection } = await isHolder(
        collection[0],
        collection[1],
        address
      );
      if (isHolderOfCollection) {
        hasNFT = true;
        break;
      }
    }
    if (hasNFT) {
      break;
    }
  }

  if (!hasNFT) {
    return res.status(400).json({
      message: "User does not own NFT",
    });
  }

  // Find Reward with reward_id and address
  let reward = await Reward.findOne({
    campaignId: campaignId,
  });

  // Check if reward exists
  if (!reward) {
    return res.status(400).json({
      message: "Reward not found",
    });
  }

  let code = reward.availableCodes[0];
  // Check if user has already claimed reward
  if (campaign.claimedAddresses.includes(address)) {
    return res.status(200).json({
      message: "Reward already redeemed",
      code: code,
    });
  }

  campaign.remaining -= 1;
  campaign.claimedAddresses.push(address);
  await campaign.save();

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

  console.log("🚀 | exports.redeemReward= | user", user);
  // Redeem reward
  user.claimedRewards.push(reward);
  await user.save();
  // reward.quantity -= 1;
  // reward.quantity_used += 1;
  // await reward.save();

  return res.status(200).json({
    message: "Reward redeemed",
    code: code,
  });
};

// TODO: hasClaimed

/**
 * GET /api/v1/reward/hasClaimed
 * @summary Check if user has claimed a reward for a campaignId
 * @description Check if user has claimed a reward for a campaignId
 * @tags Rewards
 * @param {string} address.query.required - Address of the user account
 * @param {string} campaignId.query.required - Campaign Id to redeem rewards from
 * @return {HasRedeemedResponse} 200 - Success Response - application/json
 * @example response - 200 - Return true if user has claimed reward
 * {
 *   "hasClaimed": true,
 *   "message": "Reward already redeemed"
 * }
 * @example response - 200 - Return false if user has claimed reward
 * {
 *   "hasClaimed": false,
 *   "message": "Reward not redeemed"
 * }
 * @return {DefaultErrorResponse} 400 - Bad request response
 * @example response - 400 - Invalid user address
 * {
 *   "message": "Invalid address"
 * }
 */
exports.hasClaimed = async (req, res, next) => {
  let { address, campaignId } = req.query;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  let campaign = await Campaign.findOne({ _id: campaignId });

  // Check if user has already claimed reward
  if (campaign.claimedAddresses.includes(address)) {
    return res.status(200).json({
      hasClaimed: true,
      message: "Reward already redeemed",
    });
  } else {
    return res.status(200).json({
      hasClaimed: false,
      message: "Reward not redeemed",
    });
  }
};

// TODO: userRewards

/**
 * GET /api/v1/reward/userRewards
 * @summary View user's claimed rewards
 * @description View user's claimed rewards
 * @tags Rewards
 * @param {string} address.query.required - Address of the user account (e.g. 0x5672C4871b615AA45B090a790646cfC8305beDdf)
 * @return {UserRewardsResponse} 200 - Success Response - application/json
 * @example request - User with NFT
 * {
 *  "address": "0x5672C4871b615AA45B090a790646cfC8305beDdf",
 * }
 * @example response - 200 - Return list of user rewards
 * {
 *   "address": "0x1234567890ABCDEF",
 *   "rewards": []
 * }
 * @return {DefaultErrorResponse} 400 - Bad request response
 * @example response - 400 - Invalid address
 * {
 *   "message": "Invalid address"
 * }
 */
exports.userRewards = async (req, res, next) => {
  let { address } = req.query;

  // Check if valid address
  try {
    address = ethers.utils.getAddress(address);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Invalid address",
    });
  }

  let user = await Users.findOne({ address: address }, { claimedRewards: 1 });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  } else {
    // Expand rewards
    let rewards = await Reward.find({ _id: user.claimedRewards });
    console.log("🚀 | exports.userRewards= | rewards", rewards);

    return res.status(200).json({
      address: address,
      rewards: rewards,
    });
  }
};

// TODO: Change to 1 code per brand
// TODO: Change Mints left logic
