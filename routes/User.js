const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { validateBid } = require("../middlewares/validators/auctionValidator");

const { bindAddress, getNfts, refreshNfts } = require("../controllers/User");

router.route("/bind").post(bindAddress);
router.route("/nfts").get(getNfts);
router.route("/refresh").get(refreshNfts);

module.exports = router;
