const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleUserLogout = require("../../controllers/user/userLogout.controller");
const router = express.Router();

router.post("/", asyncHandler(handleUserLogout));

module.exports = router;