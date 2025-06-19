const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleUserValidTokens = require("../../controllers/user/userValidTokens.controller");
const router = express.Router();

router.post("/", asyncHandler(handleUserValidTokens));

module.exports = router;