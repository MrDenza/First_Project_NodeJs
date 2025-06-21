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
router.use("/api/user", userRouter); // Родительский маршрут

// Основные маршруты без родителей
router.use('/', require("./ssr.route")); // Ставить в конце, так как SSR съедает все GET-запросы

module.exports = router;