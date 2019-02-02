////////////////
// CONNECTION //
////////////////
process.env.PORT = process.env.PORT || 3000;
process.env.PASS = process.env.PASS || "debug";

///////////
// TOKEN //
///////////
process.env.TOKEN_USER = process.env.TOKEN_USER || 'admin';
process.env.TOKEN_SEED = process.env.TOKEN_SEED || '0000-0000-0000-0000';
process.env.TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '1h';
process.env.TOKEN_COOKIE = process.env.TOKEN_COOKIE || 'token';
process.env.TOKEN_PENALTY = process.env.TOKEN_PENALTY || 1000;