const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

/**
 * Verifies the customer JWT sent as `auth-token` (or `Authorization: Bearer`)
 * and attaches the *server side* identity to `req.user`.
 *
 * Routes must read the email from `req.user.email` rather than `req.body.email`
 * — trusting the body is what previously let any caller read anyone's orders.
 */
const fetchUser = async (req, res, next) => {
    const header = req.header('auth-token') || req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : header;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Missing authentication token' });
    }

    try {
        const payload = jwt.verify(token, env.jwtSecret);
        const user = await User.findById(payload.user.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid authentication token' });
        }

        req.user = { id: user.id, email: user.email, name: user.name };
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
    }
};

module.exports = fetchUser;
