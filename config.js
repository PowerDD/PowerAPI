var config = {}

config.mssql = {
    user: process.env.mssqlUsername,
    password: process.env.mssqlPassword,
    server: process.env.mssqlServer,
    database: process.env.mssqlDatabase,
	options: {
        encrypt: true
    }
};

config.crypto = {};
config.crypto.algorithm = process.env.cryptoAlgorithm;
config.crypto.password = process.env.cryptoPassword;

module.exports = config;