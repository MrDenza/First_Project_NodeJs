const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handlePostDelete = require("../../controllers/posts/postsDelete.controller");
const authCheck = require("../../middlewares/authCheck.middleware");
const router = express.Router();

router.delete("/:id", authCheck, asyncHandler(handlePostDelete));

module.exports = router;