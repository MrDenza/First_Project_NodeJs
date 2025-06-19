const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleUserRegistration = require("../../controllers/user/userReg.controller");
const router = express.Router();

router.post("/", asyncHandler(handleUserRegistration));

module.exports = router;