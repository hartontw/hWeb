/**
 * @author Daniel Martínez Priego
 * @backend private folder
 * @frontend public folder
 */

process.env.ROOT = __dirname;

require('./private/server.js');