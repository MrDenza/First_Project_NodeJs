const express = require("express");
const asyncHandler = require("../../utils/asyncHandler.util");
const authCheck = require("../../middlewares/authCheck.middleware");
const handleFavoriteAdd = require("../../controllers/user/userFavoritesAdd.controller");
const handleFavoriteRemove = require("../../controllers/user/userFavoritesRemove.controller");
const router = express.Router();

router.post("/:id", authCheck, asyncHandler(handleFavoriteAdd));
router.delete("/:id", authCheck, asyncHandler(handleFavoriteRemove));

module.exports = router;