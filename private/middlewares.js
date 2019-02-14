const jwt = require('jsonwebtoken');

const middlewares = {
    verifyToken: (req, res, next) => {
        const token = req.cookies[process.env.TOKEN_COOKIE];
        jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
            if (err) {
                res.redirect('/login');
            } else {
                req.user = decoded.user;
                next();
            }
        });
    }
}

module.exports = middlewares;