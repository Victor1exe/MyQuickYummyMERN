const env = require('../config/env');

const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
};

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;

    if (status >= 500) {
        console.error('[error]', err);
    }

    res.status(status).json({
        success: false,
        error: status >= 500 && env.isProduction ? 'Internal server error' : err.message,
        ...(env.isProduction ? {} : { stack: err.stack })
    });
};

module.exports = { notFound, errorHandler };
