// Обёртка для обработки async-ошибок во всех маршрутах
module.exports = function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res)).catch(next);
    };
};

// Использование:

// 1. СОЗДАЁМ middleware:
// Нужно именно 4 атрибута, тогда Express понимает что это "ошибочный middleware"
// Цепочка логики работы такого middleware:
// 1.req -> 2.middleware -> 3.route \/ -> 4.service
//                                  \/ 3.1 throw err -> 3.2 next(err) -> 3.3 errorHandler
/* КОД:
module.exports = async function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ status: "error", error: "Internal Server Error" });
    // next() - не нужен!
}
*/

// 2. ПОДКЛЮЧАЕМ ЕГО ПОСЛЕ ВСЕХ MIDDLEWARE:
// Обязательно после всех!
// app.use(middleware1); // 1. выполнится
// app.use(routes); // 2. выполнится
/* КОД:
app.use(errorHandler); // 3. выполнится ТОЛЬКО если был вызван next(err)
*/

// 3. ОБОРАЧИВАЕМ ФУНКЦИЮ ROUTE В asyncHandler:
/* КОД:
const asyncHandler = require("../utils/asyncHandler.util");
router.post("/home", asyncHandler(() => {
    // *** код ***
}));
*/