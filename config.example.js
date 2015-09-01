var config = {}

config.systemName = 'PowerDD';
config.apiKey = '123';
config.shopIdTest = '001';
config.port = 1234;


config.mssql = {
    user: 'username',
    password: 'password',
    server: 'server',
    database: 'database',
	options: {
        encrypt: true
    }
};

config.crypto = {};
config.crypto.algorithm = 'ssl';
config.crypto.password = 'abc123';

module.exports = config;