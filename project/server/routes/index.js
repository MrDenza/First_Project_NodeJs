const express = require("express");
const router = express.Router();

//Вложенные /user-маршруты
const userRouter = express.Router();
userRouter.use("/register", require("./user/userReg.route"));
userRouter.use("/login", require("./user/userLogin.route"));
userRouter.use("/resend-verification", require("./user/userResendAct.route"));
userRouter.use("/activated", require("./user/userActivated.route"));
userRouter.use("/validate-tokens", require("./user/userValidTokens.route"));
userRouter.use("/logout", require("./user/userLogout.route"));
userRouter.use("/favorites", require("./user/userFavorites.route"));
router.use("/api/user", userRouter); // Родительский маршрут

const postsRouter = express.Router();
postsRouter.use("/create", require("./posts/postsCreate.route"));
postsRouter.use("/update", require("./posts/postsUpdate.route"));
postsRouter.use("/upload", require("./posts/postsUpload.route"));
postsRouter.use("/get", require("./posts/postsGet.route"));
postsRouter.use("/delete", require("./posts/postsDelete.route"));
postsRouter.use("/user", require("./posts/postsUser.route"));
postsRouter.use("/favorites", require("./posts/postsUserFavorites.route"));
postsRouter.use("/feed", require("./posts/postsFeed.route"));
postsRouter.use("/search", require("./posts/postsSearch.route"));
router.use("/api/posts",postsRouter); // Родительский маршрут

// Основные маршруты без родителей
router.use('/sitemap.xml', require('./sitemap.route'));
router.use('/', require("./ssr.route")); // Ставить в конце, так как SSR съедает все GET-запросы

module.exports = router;