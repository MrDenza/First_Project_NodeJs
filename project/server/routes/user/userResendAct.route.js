const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleResendActivation = require("../../controllers/user/userResendAct.controller");
const router = express.Router();

router.post("/", asyncHandler(handleResendActivation));

module.exports = router;