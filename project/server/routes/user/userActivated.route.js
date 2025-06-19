const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleActivation = require("../../controllers/user/userActivated.controller");
const router = express.Router();

router.get("/", asyncHandler(handleActivation));

module.exports = router;