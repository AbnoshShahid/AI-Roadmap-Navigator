const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
    roadmapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
        required: true,
        unique: true
    },
    completionRate: {
        type: Number,
        default: 0
    },
    totalSkills: {
        type: Number,
        default: 0
    },
    completedSkillsCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['On Track', 'Stalled', 'Needs Attention', 'Just Started'],
        default: 'Just Started'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Evaluation', EvaluationSchema);
