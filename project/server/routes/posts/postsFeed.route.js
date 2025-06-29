const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleFeedGet = require("../../controllers/posts/postsFeed.controller");
const router = express.Router();

router.get("/", asyncHandler(handleFeedGet));

module.exports = router;