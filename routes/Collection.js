const express = require("express");
const router = express.Router();

const { cacheCollection, getCollection } = require("../controllers/Collection");

router.route("/cache").post(cacheCollection);
router.route("/").get(getCollection);

module.exports = router;
