const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const env = require('../config/env');
const fetchAdmin = require('../middleware/fetchAdmin');
const asyncHandler = require('../middleware/asyncHandler');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

// Tighter than the customer limit: there is exactly one admin credential, so a
// successful guess hands over the whole console.
const adminLoginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many admin login attempts. Please try again later.' });

/** Length-safe constant-time compare, so login timing leaks nothing. */
const safeEqual = (a, b) => {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) {
        // Still burn a comparison so the failure path costs the same.
        crypto.timingSafeEqual(bufA, bufA);
        return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
};

router.post(
    '/login',
    adminLoginLimiter,
    [
        body('email').isEmail().withMessage('A valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const emailOk = safeEqual(req.body.email.toLowerCase().trim(), env.adminEmail);
        const passwordOk = safeEqual(req.body.password, env.adminPassword);

        if (!emailOk || !passwordOk) {
            return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
        }

        const adminToken = jwt.sign(
            { admin: { email: env.adminEmail, role: 'admin' } },
            env.adminJwtSecret,
            { expiresIn: env.adminJwtExpiresIn }
        );

        return res.json({ success: true, adminToken, admin: { email: env.adminEmail, role: 'admin' } });
    })
);

/** Used by the admin shell on mount to decide whether to bounce to /admin/login. */
router.get('/me', fetchAdmin, (req, res) => {
    res.json({ success: true, admin: req.admin });
});

module.exports = router;
