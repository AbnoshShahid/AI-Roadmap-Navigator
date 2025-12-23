const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Log Raw Headers for Debugging
    console.log('[Auth Middleware] Req Headers:', JSON.stringify(req.headers, null, 2));

    // 2. Get token from header (Support both Authorization: Bearer <token> and x-auth-token)
    let token = req.header('x-auth-token');
    const authHeader = req.header('Authorization');

    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7, authHeader.length).trim();
    }

    // 3. Check if no token
    if (!token) {
        console.warn('[Auth Middleware] No token found in headers.');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 4. Verify token
    try {
        console.log('[Auth Middleware] Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        console.log('[Auth Middleware] Token Decoded:', JSON.stringify(decoded, null, 2));

        req.user = decoded.user; // Ensure this matches logic in authController (payload structure)

        if (!req.user || !req.user.id) {
            console.error('[Auth Middleware] User ID missing in decoded token payload.');
            return res.status(401).json({ msg: 'Token valid but user ID missing' });
        }

        console.log(`[Auth Middleware] User authenticated: ${req.user.id}`);
        next();
    } catch (err) {
        console.error('[Auth Middleware] Token verification failed:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
