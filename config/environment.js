////////////////
// CONNECTION //
////////////////
process.env.PORT = process.env.PORT || 3000;
process.env.PASS = process.env.PASS || "debug";

////////////
// LOGGER //
////////////
process.env.LOGGER_PATH = process.env.LOGGER_PATH || '';
process.env.LOGGER_FILE = process.env.LOGGER_FILE || process.env.npm_package_name || `hWeb`;

///////////
// MONGO //
///////////
process.env.MONGO_USER = process.env.MONGO_USER || 'admin';
process.env.MONGO_PASS = process.env.MONGO_PASS || 'debug';
process.env.MONGO_IP = process.env.MONGO_IP || 'localhost';
process.env.MONGO_PORT = process.env.MONGO_PORT || 27017;
process.env.MONGO_DB = process.env.MONGO_DB || 'hWeb';

///////////
// TOKEN //
///////////
process.env.TOKEN_USER = process.env.TOKEN_USER || 'admin';
process.env.TOKEN_SEED = process.env.TOKEN_SEED || '0000-0000-0000-0000';
process.env.TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '1h';
process.env.TOKEN_COOKIE = process.env.TOKEN_COOKIE || 'hWeb_token';
process.env.TOKEN_PENALTY = process.env.TOKEN_PENALTY || 1000;