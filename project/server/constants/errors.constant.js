// module.exports = {
//     AUTH: {
//         SESSION_EXPIRED: {
//             type: 'error',
//             code: 'SESSION_EXPIRED',
//             message: 'Время сессии истекло. Авторизуйтесь снова.',
//             status: 400
//         },
//         USER_ALREADY_VERIFIED: {
//             type: 'error',
//             code: 'USER_ALREADY_VERIFIED',
//             message: 'Аккаунт уже активирован',
//             status: 400
//         },
//         INVALID_TOKEN: {  }
//     },
//     USER: {
//         NOT_FOUND: { }
//     },
//     GLOBAL: {
//         SERVER_ERROR: {
//             type: 'error',
//             code: 'SERVER_ERROR',
//             message: 'Ошибка сервера. Попробуйте позже.',
//             status: 500
//         },
//     },
//
//     getError: (code, customMessage) => {
//         const error = this[code] || this.SERVER_ERROR;
//         return {
//             ...error,
//             message: customMessage || error.message
//         };
//     }
// };
//
// // const error = ERRORS.getError('SESSION_EXPIRED', 'Ваша сессия завершена');