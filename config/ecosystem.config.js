//PM2 ECOSYSTEM CONFIGURATION FILE
module.exports = {
    apps: [{
        name: "hWeb",
        script: "./src/index.js",
        watch: true,
        autorestart: true,
        env: {
            NODE_ENV: "development",
            PORT: 3000,
            PASS: "debug",
            LOGGER_PATH: "",
            LOGGER_FILE: "hWeb.log",
            MONGO_USER: "admin",
            MONGO_PASS: "debug",
            MONGO_IP: "localhost",
            MONGO_PORT: 27017,
            MONGO_DB: "hWeb",
            TOKEN_USER: "admin",
            TOKEN_SEED: "0000-0000-0000-0000",
            TOKEN_EXPIRATION: "1h",
            TOKEN_COOKIE: "hWeb_token",
            TOKEN_PENALTY: 1000,
        },
        env_production: {
            NODE_ENV: "production",
            PORT: 80,
            PASS: "production",
            LOGGER_PATH: "",
            LOGGER_FILE: "hWeb.log",
            MONGO_USER: "admin",
            MONGO_PASS: "production",
            MONGO_IP: "localhost",
            MONGO_PORT: 27017,
            MONGO_DB: "hWeb",
            TOKEN_USER: "admin",
            TOKEN_SEED: "0000-0000-0000-0000",
            TOKEN_EXPIRATION: "1h",
            TOKEN_COOKIE: "hWeb_token",
            TOKEN_PENALTY: 5000,
        }
    }]
}