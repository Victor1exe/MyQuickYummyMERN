const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- Global middleware ----------------------------------------------------
// `cors` replaces the hand-rolled header block, which never answered the
// preflight OPTIONS request and did not allow the auth headers through.
app.use(
    cors({
        origin: (origin, callback) => {
            // Same-origin / curl requests arrive without an Origin header.
            if (!origin || env.corsOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Tagged with a status so the error handler answers 403 rather than
            // reporting a rejected origin as an internal server error.
            const error = new Error(`Origin ${origin} is not allowed by CORS`);
            error.status = 403;
            return callback(error);
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'auth-token', 'admin-token', 'Authorization']
    })
);

app.use(express.json({ limit: '1mb' }));

// --- Routes ---------------------------------------------------------------
app.get('/', (req, res) => {
    res.json({ success: true, service: 'My Quick Yummy API', env: env.nodeEnv });
});

app.get('/api/health', (req, res) => {
    res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

app.use('/api', require('./routes/Createuser'));
app.use('/api', require('./routes/DisplayData'));
app.use('/api', require('./routes/OrderData'));
app.use('/api', require('./routes/PublicContent'));
app.use('/api/admin', require('./routes/AdminAuth'));
app.use('/api/admin', require('./routes/Admin'));

app.use(notFound);
app.use(errorHandler);

// --- Boot -----------------------------------------------------------------
// The database is connected *before* the port opens, so the server never
// serves requests it cannot fulfil.
const start = async () => {
    try {
        await connectDB();
        app.listen(env.port, () => {
            console.log(`[api] My Quick Yummy API listening on http://localhost:${env.port}`);
        });
    } catch (error) {
        console.error('[api] failed to start:', error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    start();
}

module.exports = { app, start };
