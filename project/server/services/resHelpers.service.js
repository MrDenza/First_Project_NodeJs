// module.exports.sendSuccessResponse = (res, status = 200, data = null, code = 'SUCCESS', message = '') => {
//     return res.status(status).json({
//         success: true,
//         code,
//         status,
//         message,
//         data
//     });
// };
//
// module.exports.sendErrorResponse = (res, status = 400, code = 'ERROR', message = '', errors = null) => {
//     return res.status(status).json({
//         success: false,
//         code,
//         status,
//         message,
//         errors
//     });
// };
//
// module.exports.redirectWithError = (res, status, message) => {
//     return res.redirect(`/error?code=${status}&message=${encodeURIComponent(message)}`);
// };
//
// module.exports.redirectWithSuccess = (res, url, message) => {
//     return res.redirect(`${url}?success=${encodeURIComponent(message)}`);
// };