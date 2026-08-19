const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Reads an environment variable and fails fast when a required one is missing,
 * so the server never boots with a half configured security setup.
 */
const required = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(
            `Missing required environment variable "${key}". ` +
            'Copy backend/.env.example to backend/.env and fill it in.'
        );
    }
    return value;
};

const optional = (key, fallback) => process.env[key] || fallback;

const env = {
    port: parseInt(optional('PORT', '5000'), 10),
    nodeEnv: optional('NODE_ENV', 'development'),
    isProduction: optional('NODE_ENV', 'development') === 'production',

    corsOrigins: optional('CORS_ORIGIN', 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),

    mongoUri: required('MONGO_URI'),

    jwtSecret: required('JWT_SECRET'),
    jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),

    adminEmail: required('ADMIN_EMAIL').toLowerCase(),
    adminPassword: required('ADMIN_PASSWORD'),
    adminJwtSecret: required('ADMIN_JWT_SECRET'),
    adminJwtExpiresIn: optional('ADMIN_JWT_EXPIRES_IN', '12h')
};

// --- Boot-time sanity checks ----------------------------------------------
// Customer and admin tokens are kept on separate secrets so a customer token
// can never be replayed against an admin route. Nothing enforced that they
// actually differ, though — and .env.example lists them next to each other,
// which makes copying one into the other an easy mistake that silently
// collapses the whole separation. Fail loudly instead.
if (env.jwtSecret === env.adminJwtSecret) {
    throw new Error(
        'JWT_SECRET and ADMIN_JWT_SECRET must be different values. Sharing one ' +
        'secret lets a customer token authenticate as an admin.'
    );
}

// A short secret is brute-forceable offline; a signing key is not a password.
const MIN_SECRET_LENGTH = 32;
['JWT_SECRET', 'ADMIN_JWT_SECRET'].forEach((key) => {
    if (process.env[key].length < MIN_SECRET_LENGTH) {
        throw new Error(
            `${key} is only ${process.env[key].length} characters. Use at least ` +
            `${MIN_SECRET_LENGTH}: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
        );
    }
});

module.exports = env;
