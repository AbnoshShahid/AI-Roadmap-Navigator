const evaluationService = require('../services/evaluationService');
const mongoose = require('mongoose');

exports.getEvaluation = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            // Mock response if no DB
            return res.status(200).json({ completionRate: 0, status: 'No DB Connection' });
        }

        const { roadmapId } = req.params;
        // Trigger re-evaluation on fetch to ensure freshness
        const evaluation = await evaluationService.evaluateProgress(roadmapId);

        if (!evaluation) {
            return res.status(404).json({ error: 'Evaluation not found or Roadmap missing.' });
        }

        res.status(200).json(evaluation);
    } catch (error) {
        next(error);
    }
};

exports.exportData = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected.' });
        }
        const data = await evaluationService.exportDataset();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};
