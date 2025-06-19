module.exports = {
    EMAIL: {
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        pool: true,
        maxConnections: 5,
        rateDelta: 1000,
        rateLimit: 5
    },
    LINK: `${(process.env.NODE_ENV === 'development') ? process.env.SERVER_DEV_LINK : process.env.SERVER_LINK}/api/user/activated`,
}