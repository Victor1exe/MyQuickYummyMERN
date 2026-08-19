const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const env = require('../config/env');
const asyncHandler = require('../middleware/asyncHandler');
const fetchUser = require('../middleware/fetchUser');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

// Brute-force protection. Signup is capped too, so the endpoint cannot be used
// to mass-create accounts or to probe which emails are already registered.
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts. Please try again in a few minutes.' });
const signupLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: 'Too many accounts created from this address. Please try again later.' });

router.post(
    '/createuser',
    signupLimiter,
    [
        body('email').isEmail().withMessage('A valid email is required'),
        body('name').isLength({ min: 5 }).withMessage('Name must be at least 5 characters'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
        body('location').notEmpty().withMessage('Location is required')
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const email = req.body.email.toLowerCase().trim();

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, error: 'An account with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const secPassword = await bcrypt.hash(req.body.password, salt);

        await User.create({
            name: req.body.name,
            password: secPassword,
            email,
            location: req.body.location
        });

        return res.status(201).json({ success: true });
    })
);

router.post(
    '/loginuser',
    loginLimiter,
    [
        body('email').isEmail().withMessage('A valid email is required'),
        body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters')
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const email = req.body.email.toLowerCase().trim();
        const userData = await User.findOne({ email });

        // Same response for "no such user" and "wrong password" so the endpoint
        // cannot be used to enumerate registered emails.
        const invalid = () =>
            res.status(400).json({ success: false, error: 'Try logging in with correct credentials' });

        if (!userData) {
            return invalid();
        }

        const pwdCompare = await bcrypt.compare(req.body.password, userData.password);
        if (!pwdCompare) {
            return invalid();
        }

        const authToken = jwt.sign({ user: { id: userData.id } }, env.jwtSecret, {
            expiresIn: env.jwtExpiresIn
        });

        return res.json({
            success: true,
            authToken,
            user: { name: userData.name, email: userData.email }
        });
    })
);

/** Lets the client confirm a stored token is still valid before trusting it. */
router.get(
    '/me',
    fetchUser,
    asyncHandler(async (req, res) => {
        res.json({ success: true, user: req.user });
    })
);

module.exports = router;
