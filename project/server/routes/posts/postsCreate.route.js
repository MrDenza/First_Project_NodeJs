const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const authCheck = require("../../middlewares/authCheck.middleware");
const handlePostsCreate = require("../../controllers/posts/postsCreate.controller");
const router = express.Router();

router.post("/", authCheck, asyncHandler(handlePostsCreate));

module.exports = router;