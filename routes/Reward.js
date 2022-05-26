const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { validateBid } = require("../middlewares/validators/auctionValidator");

const { getRewards, redeemReward } = require("../controllers/User");

router.route("/").get(getRewards);
router.route("/redeem").put(redeemReward);

module.exports = router;
