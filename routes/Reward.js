const express = require("express");
const router = express.Router();

const { getRewards, redeemReward } = require("../controllers/Reward");

router.route("/").get(getRewards);
router.route("/redeem").put(redeemReward);

module.exports = router;
