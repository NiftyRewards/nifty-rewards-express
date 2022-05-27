const Reward = require("../models/Rewards.model");

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
};
exports.redeemReward = async (req, res, next) => {};
