const express = require("express");
const router = express.Router();

const { cacheCollection } = require("../controllers/Collection");

router.route("/cache").post(cacheCollection);

module.exports = router;
