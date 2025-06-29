const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleSearch = require("../../controllers/posts/postsSearch.controller");
const router = express.Router();

router.get("/", asyncHandler(handleSearch));

module.exports = router;