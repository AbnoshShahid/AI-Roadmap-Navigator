const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper: Hard Timeout Wrapper
const withTimeout = (promise, ms = 2000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation Timed Out')), ms)
        )
    ]);
};

// @route   POST api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        // DB Check
        if (mongoose.connection.readyState !== 1) {
            console.error(`[AUTH] 503 Error: DB not ready. State: ${mongoose.connection.readyState}`);
            return res.status(503).json({ msg: 'Database unavailable' });
        }

        // DB Operations with Timeout
        const result = await withTimeout((async () => {
            let user = await User.findOne({ email });
            if (user) return { error: 'User already exists', status: 400 };

            user = new User({ name, email, password });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            return { user };
        })());

        if (result.error) {
            return res.status(result.status).json({ msg: result.error });
        }

        const { user } = result;
        const payload = { user: { id: user.id } };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '5d' }
        );

        return res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        // Catch timeout or other errors
        return res.status(500).json({ msg: err.message || 'Server error' });
    }
});

// @route   POST api/auth/login
// @access  Public
// @route   POST api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    console.log(`[AUTH] Login Hit: ${req.body.email} from ${req.ip}`);
    console.log("LOGIN ROUTE HIT - Email:", req.body.email);
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        if (mongoose.connection.readyState !== 1) {
            console.error(`[AUTH] Login 503: DB State ${mongoose.connection.readyState}`);
            return res.status(503).json({ msg: 'Database unavailable' });
        }

        // MANDATORY TIMEOUT WRAPPER
        const result = await withTimeout((async () => {
            const user = await User.findOne({ email });
            console.log(`[AUTH] User Lookup: ${email} -> Found: ${!!user}`);

            if (!user) {
                console.warn(`[AUTH] Login Failed: User not found for ${email}`);
                return { error: 'Invalid Credentials', status: 401 };
            }

            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`[AUTH] Password Compare for ${email} -> Match: ${isMatch}`);

            if (!isMatch) {
                console.warn(`[AUTH] Login Failed: Password mismatch for ${email}`);
                return { error: 'Invalid Credentials', status: 401 };
            }

            return { user };
        })(), 3000); // 3 seconds max

        if (result.error) {
            return res.status(result.status).json({ msg: result.error });
        }

        const { user } = result;
        const payload = { user: { id: user.id } };

        // Synchronous Sign
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '5d' }
        );

        return res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        if (err.message === 'Operation Timed Out') {
            return res.status(504).json({ msg: 'Login Request Timed Out' });
        }
        return res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/auth/user
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await withTimeout(
            User.findById(req.user.id).select('-password'),
            2000
        );

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
