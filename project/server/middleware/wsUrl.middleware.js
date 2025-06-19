module.exports = function wsUrlMiddleware(req, res, next) {
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const protocol = isSecure ? 'wss' : 'ws';
    req.wsUrl = `${protocol}://${req.headers.host}/uploadprogress`;

    next();
};
