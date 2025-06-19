module.exports = {
    MYSQL: {
        host : process.env.MYSQL_HOST,
        user : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASS,
        database : process.env.MYSQL_DATABASE,
        connectionLimit : 20,
        waitForConnections: true,
        maxIdle: 5,
        queueLimit: 0,
        idleTimeout: 10000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        pool: {
            max: 20,
            min: 2,
            acquireTimeout: 30000,
            idleTimeout: 10000,
            reapIntervalMillis: 10000,
            createRetryIntervalMillis: 200
        }
    }
}