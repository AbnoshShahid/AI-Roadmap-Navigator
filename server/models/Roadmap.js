const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Required for Phase 11, might need soft handling for legacy docs
    },
    role: {
        type: String,
        required: true,
    },
    education: {
        type: String,
        required: true,
    },
    // Structured Data Fields
    userSummary: {
        role: String,
        education: String,
        currentSkills: String,
        interests: String
    },
    jobSuggestions: [{
        title: String,
        description: String
    }],
    skillsAnalysis: {
        requiredSkills: [String],
        existingSkills: [String],
        missingSkills: [String],
        matchPercentage: Number
    },
    // The main roadmap phases
    roadmap: [{
        phase: String,
        focus: String,
        skills: [String],
        projects: [String]
    }],
    progress: {
        totalSkills: {
            type: Number,
            default: 0
        },
        completedSkills: {
            type: Number,
            default: 0
        },
        percentage: {
            type: Number,
            default: 0
        },
        skills: [{
            name: String,
            completed: {
                type: Boolean,
                default: false
            }
        }],
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
