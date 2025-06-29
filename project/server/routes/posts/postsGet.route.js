const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handlePostsGet = require("../../controllers/posts/postsGet.controller");
const router = express.Router();

router.get("/:id", asyncHandler(handlePostsGet));

module.exports = router;