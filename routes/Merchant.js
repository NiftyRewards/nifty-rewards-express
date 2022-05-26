const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { validateBid } = require("../middlewares/validators/auctionValidator");

const {
  getMerchants,
  getMerchant,
  createMerchant,
  verifyMerchant,
  editMerchant,
} = require("../controllers/User");

router.route("/").get(getMerchants);
router.route("/:merchantAddress").get(getMerchant);
router.route("/:merchantAddress/edit").put(editMerchant);
router.route("/create").post(createMerchant);
router.route("/:merchantAddress/verify").put(verifyMerchant);

module.exports = router;
