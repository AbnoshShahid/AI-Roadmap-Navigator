const Progress = require('../models/Progress');
const mongoose = require('mongoose');

exports.updateProgress = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected.' });
        }

        const { roadmapId, completedSkills } = req.body;

        if (!roadmapId) {
            return res.status(400).json({ error: 'Roadmap ID is required.' });
        }

        // Upsert: Create or Update
        const progress = await Progress.findOneAndUpdate(
            { roadmapId },
            {
                roadmapId,
                completedSkills,
                lastUpdated: Date.now()
            },
            { new: true, upsert: true }
        );

        res.status(200).json(progress);
    } catch (error) {
        next(error);
    }
};

exports.getProgress = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({ completedSkills: [] }); // Graceful fallback
        }

        const { roadmapId } = req.params;
        const progress = await Progress.findOne({ roadmapId });

        if (!progress) {
            return res.status(200).json({ completedSkills: [] });
        }

        res.status(200).json(progress);
    } catch (error) {
        next(error);
    }
};
