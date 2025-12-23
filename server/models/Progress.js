const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    roadmapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
        required: true,
        unique: true // One progress record per roadmap
    },
    completedSkills: {
        type: [String],
        default: []
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Progress', ProgressSchema);
