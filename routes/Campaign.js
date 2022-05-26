const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const { validateBid } = require("../middlewares/validators/auctionValidator");

const {
  startCampaign,
  editCampaign,
  getCampaign,
  approveCampaign,
} = require("../controllers/Campaign");

router.route("/start").post(startCampaign);
router.route("/:campaignId").get(getCampaign);
router.route("/:campaignId/edit").put(editCampaign);
router.route("/approve").put(approveCampaign);

module.exports = router;
