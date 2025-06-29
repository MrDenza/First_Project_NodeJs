const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const handleUserFavoritesGet = require("../../controllers/posts/postsFavorites.controller");
const authCheck = require('../../middlewares/authCheck.middleware');
const router = express.Router();

router.get("/", authCheck, asyncHandler(handleUserFavoritesGet));

module.exports = router;