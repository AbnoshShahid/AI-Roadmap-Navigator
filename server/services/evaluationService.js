const Evaluation = require('../models/Evaluation');
const Roadmap = require('../models/Roadmap');
const Progress = require('../models/Progress');

exports.evaluateProgress = async (roadmapId) => {
    // Fetch Roadmap and Progress
    const roadmap = await Roadmap.findById(roadmapId);
    const progress = await Progress.findOne({ roadmapId });

    if (!roadmap || !progress) {
        return null;
    }

    // Simple Metric Computation
    // In a real app, 'totalSkills' would come from parsing the roadmap steps or the structured skills array.
    // For this MVP, let's use the 'skillGaps' length + user initial skills as a proxy for "Total Scope",
    // OR just use the length of 'completedSkills' vs a fixed target or estimation.
    // Let's assume the frontend passes the 'totalSkills' count, or we estimate it.
    // Better yet, let's just track the skills we KNOW about from the Skill Gap analysis + initial input.

    // For simplicity: Total = Initial Skills + Skill Gaps.
    const initialSkillsCount = roadmap.skills ? roadmap.skills.length : 0;
    const gapsCount = roadmap.skillGaps ? roadmap.skillGaps.length : 0;
    const totalSkillsEstimated = initialSkillsCount + gapsCount || 10; // Default to 10 if unknown

    const completedCount = progress.completedSkills.length;
    const completionRate = Math.min(100, Math.round((completedCount / totalSkillsEstimated) * 100));

    // Status Determination
    let status = 'On Track';
    const daysSinceLastUpdate = (Date.now() - new Date(progress.lastUpdated).getTime()) / (1000 * 3600 * 24);

    if (completionRate === 0) status = 'Just Started';
    else if (daysSinceLastUpdate > 7) status = 'Stalled';
    else if (completionRate < 10 && daysSinceLastUpdate > 3) status = 'Needs Attention';

    // Upsert Evaluation
    const evaluation = await Evaluation.findOneAndUpdate(
        { roadmapId },
        {
            roadmapId,
            completionRate,
            totalSkills: totalSkillsEstimated,
            completedSkillsCount: completedCount,
            status,
            lastUpdated: Date.now()
        },
        { new: true, upsert: true }
    );

    return evaluation;
};

exports.exportDataset = async () => {
    // Fetch all evaluations with their roadmaps
    const evaluations = await Evaluation.find().populate('roadmapId');

    // Convert to CSV-like structure (JSON for now)
    const dataset = evaluations.map(ev => {
        const r = ev.roadmapId;
        return {
            role: r ? r.role : 'Unknown',
            education: r ? r.education : 'Unknown',
            startSkills: r ? r.skills.join(';') : '',
            finalCompletionRate: ev.completionRate,
            outcome: ev.status
        };
    });

    return dataset;
};
