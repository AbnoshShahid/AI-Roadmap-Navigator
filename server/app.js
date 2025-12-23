const express = require('express');
const cors = require('cors');
const roadmapRoutes = require('./routes/roadmapRoutes');
const progressRoutes = require('./routes/progressRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost and Railway domains
        if (origin.match(/^http:\/\/localhost:\d+$/) || origin.endsWith('.up.railway.app') || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
            return callback(null, true);
        }

        // Allowed specific production frontend if known (fallback to all if strictly needed, but better to be safe)
        // For this task, we will allow all to ensure connectivity as requested ("no CORS errors")
        // but strictly speaking, we check the pattern above.
        // Let's add a wildcard fallback for now if the above fails, or just strict?
        // User asked for "production-safe". Pattern matching is better than *.

        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/evaluation', evaluationRoutes);

// Health Check
const mongoose = require('mongoose');
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const status = dbState === 1 ? 'connected' : 'disconnected';
    res.json({ status: 'ok', database: status, readyState: dbState });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

module.exports = app;
