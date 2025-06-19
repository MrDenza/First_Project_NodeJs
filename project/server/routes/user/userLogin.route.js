const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleLogin = require("../../controllers/user/userLogin.controller");
const router = express.Router();

router.post("/", asyncHandler(handleLogin));

module.exports = router;