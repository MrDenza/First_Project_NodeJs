const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handlePostsUpdate = require("../../controllers/posts/postsUpdate.controller");
const authCheck = require("../../middlewares/authCheck.middleware");
const router = express.Router();

router.post("/:id", authCheck, asyncHandler(handlePostsUpdate));

module.exports = router;