const express = require('express');
const asyncHandler = require('../utils/asyncHandler.util');
const router = express.Router();
const handleSitemap = require("../controllers/sitemap.controller");

router.get("/", asyncHandler(handleSitemap));

module.exports = router;