const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { validateBid } = require("../middlewares/validators/auctionValidator");

const {
  startCampaign,
  editCampaign,
  getCampaign,
  getAllCampaigns,
  pauseCampaign,
  unpauseCampaign,
  approveCampaign,
  getEligibleCampaigns,
  getMerchantCampaigns,
} = require("../controllers/Campaign");

router.route("/start").post(startCampaign);
router.route("/").get(getCampaign);
router.route("/edit").put(editCampaign);
router.route("/approve").put(approveCampaign);
router.route("/eligible").get(getEligibleCampaigns);
router.route("/merchant").get(getMerchantCampaigns);
router.route("/pause").put(pauseCampaign);
router.route("/unpause").put(unpauseCampaign);

module.exports = router;
