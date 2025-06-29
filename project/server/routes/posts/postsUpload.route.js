const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handlePostsUpload = require("../../controllers/posts/postsUpload.controller");
const authCheck = require("../../middlewares/authCheck.middleware");
const router = express.Router();

router.post("/:id", authCheck, asyncHandler(handlePostsUpload));

module.exports = router;