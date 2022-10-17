const express = require("express");
const router = express.Router();

const {
  getRewards,
  redeemReward,
  userRewards,
  hasClaimed,
} = require("../controllers/Reward");

router.route("/").get(getRewards);
router.route("/redeem").put(redeemReward);
router.route("/userRewards").get(userRewards);
router.route("/hasClaimed").get(hasClaimed);

module.exports = router;
