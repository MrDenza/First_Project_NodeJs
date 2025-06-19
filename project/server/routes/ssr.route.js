const express = require("express");
const router = express.Router();
const handleSite = require("../controllers/ssr.controller");
const asyncHandler = require("../utils/asyncHandler.util");

router.get("*", asyncHandler(handleSite));

module.exports = router;