const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleUserPostsGet = require("../../controllers/posts/postsUser.controller");
const authCheck = require('../../middlewares/authCheck.middleware');
const router = express.Router();

router.get("/", authCheck, asyncHandler(handleUserPostsGet));

module.exports = router;