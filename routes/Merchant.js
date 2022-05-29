const express = require("express");
const router = express.Router();

const {
  getMerchants,
  getMerchant,
  createMerchant,
  verifyMerchant,
  editMerchant,
} = require("../controllers/Merchant");

// router.route("/").get(getMerchants);
// router.route("/:merchantAddress").get(getMerchant);
// router.route("/:merchantAddress/edit").put(editMerchant);
router.route("/create").post(createMerchant);
// router.route("/:merchantAddress/verify").put(verifyMerchant);

module.exports = router;
