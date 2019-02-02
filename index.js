/**
 * @author Daniel Martínez Priego
 * @backend private folder
 * @frontend public folder
 */

const server = require('./private/server.js');

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated')
    })
});

process.on('SIGINT', () => {
    console.log('Process terminated')
});