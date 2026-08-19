const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Verifies the admin JWT. Admin tokens are signed with a *different* secret
 * than customer tokens, so a customer token can never be replayed against an
 * admin route even if the payload were forged to include `role: "admin"`.
 */
const fetchAdmin = (req, res, next) => {
    const header = req.header('admin-token') || req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : header;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Admin authentication required' });
    }

    try {
        const payload = jwt.verify(token, env.adminJwtSecret);

        if (!payload.admin || payload.admin.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin privileges required' });
        }

        req.admin = payload.admin;
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or expired admin token' });
    }
};

module.exports = fetchAdmin;
