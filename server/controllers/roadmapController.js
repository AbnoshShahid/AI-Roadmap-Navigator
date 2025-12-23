const aiService = require('../services/aiService');
const ruleEngine = require('../services/ruleEngine');
const mlService = require('../services/mlService');
const skillGapService = require('../services/skillGapService');
const mongoose = require('mongoose');



exports.createRoadmap = async (req, res, next) => {
    try {
        const { education, skills, interests, role } = req.body;

        if (!education || !role) {
            return res.status(400).json({ error: 'Education level and Target Role are required.' });
        }

        const { triggeredRules, reasoning, modifiedPrompt } = ruleEngine.analyzeProfile({ education, skills, interests, role });

        // Call ML Service (Optional/Parallel)
        const mlResponse = await mlService.getPredictions({ education, skills, interests });
        const mlRecommendations = mlResponse.recommendedCareers || [];

        // Attach metadata to the first recommendation for UI display (hacky but effective for current UI)
        if (mlResponse.meta && mlRecommendations.length > 0) {
            mlRecommendations[0].meta = mlResponse.meta;
        }

        // Augment prompt with ML data if available
        let augmentedPrompt = modifiedPrompt;
        if (mlRecommendations.length > 0) {
            const mlText = mlRecommendations.map(r => `${r.role} (${(r.confidence * 100).toFixed(0)}%)`).join(', ');
            augmentedPrompt += `\n    ML Model Suggestion: The user's profile statistically aligns with: ${mlText}. Consider this in the roadmap if relevant.`;
        }

        // Adaptive Intelligence: Skill Gap Analysis
        const { missingSkills, matchScore } = skillGapService.analyzeSkillGaps(Array.isArray(skills) ? skills : [], role);

        if (missingSkills.length > 0) {
            const highPriority = missingSkills.filter(s => s.priority === 'High').map(s => s.skill).join(', ');
            const medPriority = missingSkills.filter(s => s.priority === 'Medium').map(s => s.skill).join(', ');

            augmentedPrompt += `\n    SKILL GAP ANALYSIS:
            - CRITICAL MISSING SKILLS: ${highPriority || 'None'}
            - RECOMMENDED SKILLS: ${medPriority || 'None'}
            
            ADAPTIVE INSTRUCTION: prioritize the 'CRITICAL MISSING SKILLS' in the early phases of the roadmap. Ensure these specific gaps are addressed immediately.`;
        }


        const roadmap = await aiService.generateRoadmap({
            education,
            skills: Array.isArray(skills) ? skills : [],
            interests,
            role,
            augmentedPrompt
        });

        res.status(200).json({
            roadmap,
            triggeredRules,
            reasoning,
            mlRecommendations,
            skillsAnalysis: {
                missingSkills,
                matchScore
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.initializeRoadmapProgress = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected.' });
        }
        const { id } = req.params;
        const roadmap = await Roadmap.findById(id);

        if (!roadmap) {
            return res.status(404).json({ error: 'Roadmap not found.' });
        }

        // Idempotency check: If skills already exist, don't burn AI credits
        if (roadmap.progress && roadmap.progress.skills && roadmap.progress.skills.length > 0) {
            return res.status(200).json({ message: 'Progress already initialized', roadmap });
        }

        console.log(`[RoadmapController] Initializing progress for Roadmap ${id}...`);

        // REMOVED AI CALL from here as requested.
        // We now expect skills to be persisted at creation time.
        // If they are missing, we return empty list or handle gracefully without calling AI.
        // This prevents the "Failed to extract skills" error loop on the Progress page.

        console.log(`[RoadmapController] Initialize called for ${id}. Skills exist? ${!!(roadmap.progress && roadmap.progress.skills && roadmap.progress.skills.length > 0)}`);

        if (!roadmap.progress) roadmap.progress = {};
        if (!roadmap.progress.skills) roadmap.progress.skills = [];

        // If we really wanted to backfill old roadmaps, we would uncomment the AI call,
        // but the requirement is "Remove ANY AI skill extraction logic from progress or tracking routes".
        // So we just return what we have (even if empty).

        await roadmap.save();
        console.log(`[RoadmapController] Progress initialized (no AI).`);

        res.status(200).json({ message: 'Progress initialized successfully', roadmap });

    } catch (error) {
        console.error('Error initializing progress:', error);
        next(error);
    }
};

const Roadmap = require('../models/Roadmap');

exports.saveRoadmap = async (req, res, next) => {
    try {
        console.log('[RoadmapController] saveRoadmap called.');

        // Log Auth Context
        if (!req.user || !req.user.id) {
            console.error('[RoadmapController] req.user or req.user.id is missing!', req.user);
            return res.status(401).json({ error: 'Unauthorized: User ID missing.' });
        }
        console.log(`[RoadmapController] Saving for User ID: ${req.user.id}`);

        // Log Body (careful with size, maybe log keys)
        console.log('[RoadmapController] Request Body Keys:', Object.keys(req.body));

        if (mongoose.connection.readyState !== 1) {
            console.error('[RoadmapController] Database not connected.');
            return res.status(503).json({ error: 'Database not connected. Cannot save.' });
        }

        const { userSummary, jobSuggestions, skillsAnalysis, roadmap } = req.body;

        // Validation
        if (!userSummary || !roadmap) {
            console.error('[RoadmapController] Missing required fields in body.');
            return res.status(400).json({ error: 'Missing required roadmap data (userSummary or roadmap).' });
        }

        // Create new roadmap
        const newRoadmap = new Roadmap({
            user: req.user.id,
            role: userSummary.role, // Keep top-level role for searching (schema required)
            education: userSummary.education, // schema required
            userSummary,
            jobSuggestions,
            skillsAnalysis,
            roadmap // Structured array
        });

        // EXTRACT SKILLS IMMEDIATELY (Persist for Progress Tracking)
        try {
            console.log('[RoadmapController] Extracting skills for persistence...');
            const extractedSkills = await aiService.extractSkillsFromRoadmap({ skillsAnalysis, roadmap });

            if (extractedSkills && extractedSkills.length > 0) {
                const skillsList = extractedSkills.map(name => ({
                    name,
                    completed: false
                }));

                newRoadmap.progress = {
                    totalSkills: skillsList.length,
                    completedSkills: 0,
                    percentage: 0,
                    skills: skillsList,
                    lastUpdated: Date.now()
                };
                console.log(`[RoadmapController] Persisted ${skillsList.length} skills to roadmap.`);
            } else {
                console.warn('[RoadmapController] No skills extracted during save.');
            }
        } catch (skillError) {
            const fs = require('fs');
            try { fs.appendFileSync('debug_skills.log', `[${new Date().toISOString()}] roadmapController ERROR: ${skillError.message}\nStack: ${skillError.stack}\n`); } catch (e) { }
            console.error('[RoadmapController] Failed to extract skills on save (non-blocking):', skillError);
            // Proceed without skills - better to save roadmap than fail entirely
        }

        const saved = await newRoadmap.save();
        console.log(`[RoadmapController] Roadmap saved successfully! ID: ${saved._id}`);

        res.status(201).json({ message: 'Roadmap saved successfully', roadmap: saved });
    } catch (error) {
        console.error('[RoadmapController] Error saving roadmap:', error);
        res.status(500).json({ error: 'Failed to save roadmap.', details: error.message });
        next(error);
    }
};

exports.getRoadmapHistory = async (req, res, next) => {
    try {
        // Extract and deduplicate all trackable skills
        const trackableSkills = new Set();

        // 1. Add missing skills from analysis
        if (skillsAnalysis && Array.isArray(skillsAnalysis.missingSkills)) {
            skillsAnalysis.missingSkills.forEach(s => {
                if (typeof s === 'string') trackableSkills.add(s);
                else if (s.skill) trackableSkills.add(s.skill);
            });
        }

        // 2. Add skills from roadmap phases
        if (Array.isArray(roadmap)) {
            roadmap.forEach(phase => {
                if (Array.isArray(phase.skills)) {
                    phase.skills.forEach(s => trackableSkills.add(s));
                }
            });
        }

        const initialSkillsList = Array.from(trackableSkills).map(name => ({
            name,
            completed: false
        }));

        // Create new roadmap
        const newRoadmap = new Roadmap({
            user: req.user.id,
            role: userSummary.role, // Keep top-level role for searching (schema required)
            education: userSummary.education, // schema required
            userSummary,
            jobSuggestions,
            skillsAnalysis,
            roadmap, // Structured array
            progress: {
                totalSkills: initialSkillsList.length,
                completedSkills: 0,
                percentage: 0,
                skills: initialSkillsList
            }
        });

        const saved = await newRoadmap.save();
        console.log(`[RoadmapController] Roadmap saved successfully! ID: ${saved._id}`);

        res.status(201).json({ message: 'Roadmap saved successfully', roadmap: saved });
    } catch (error) {
        console.error('[RoadmapController] Error saving roadmap:', error);
        res.status(500).json({ error: 'Failed to save roadmap.', details: error.message });
        next(error);
    }
};

exports.getRoadmapHistory = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            // If no DB, just return empty array instead of erroring
            return res.status(200).json([]);
        }

        const history = await Roadmap.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5);
        res.status(200).json(history);
    } catch (error) {
        next(error);
    }
};

exports.getAllRoadmaps = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json([]);
        }
        const roadmaps = await Roadmap.find({ user: req.user.id }).sort({ 'progress.lastUpdated': -1, createdAt: -1 });

        // Dynamically compute progress stats to ensure dashboard is always in sync
        const syncedRoadmaps = roadmaps.map(doc => {
            const roadmap = doc.toObject(); // Convert to plain JS object to allow modification

            if (roadmap.progress && Array.isArray(roadmap.progress.skills)) {
                const total = roadmap.progress.skills.length;
                const completedCount = roadmap.progress.skills.filter(s => s.completed).length;
                const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

                roadmap.progress.totalSkills = total;
                roadmap.progress.completedSkills = completedCount;
                roadmap.progress.percentage = percentage;
                // Note: We don't save back to DB here (read-only sync), 
                // but the individual update endpoint handles persistence.
            }
            return roadmap;
        });

        res.status(200).json(syncedRoadmaps);
    } catch (error) {
        next(error);
    }
};

exports.getRoadmapById = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected.' });
        }
        const roadmap = await Roadmap.findById(req.params.id);
        if (!roadmap) {
            return res.status(404).json({ error: 'Roadmap not found' });
        }
        res.status(200).json(roadmap);
    } catch (error) {
        next(error);
    }
};

exports.updateRoadmapProgress = async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not connected.' });
        }

        const { id } = req.params;
        const { skillName, completed } = req.body;
        const userId = req.user.id;

        // 1. Fetch current state effectively to calc stats (read-only purpose)
        const currentRoadmap = await Roadmap.findOne({ _id: id, user: userId });
        if (!currentRoadmap) {
            return res.status(404).json({ error: 'Roadmap not found' });
        }

        // Initialize if missing (migration) - usually handled by saveRoadmap now, but safety check
        let skills = currentRoadmap.progress?.skills || [];

        const skillIndex = skills.findIndex(s => s.name === skillName);
        let updatedRoadmap;

        if (skillIndex > -1) {
            // Skill exists: Calculate new stats assuming this update happens
            // We create a temporary array just to count, we don't save this.
            const statsSkills = [...skills];
            statsSkills[skillIndex] = { ...statsSkills[skillIndex], completed }; // simulate update locally

            const total = statsSkills.length;
            const completedCount = statsSkills.filter(s => s.completed).length;
            const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

            // Atomic Update
            updatedRoadmap = await Roadmap.findOneAndUpdate(
                { _id: id, user: userId, "progress.skills.name": skillName },
                {
                    $set: {
                        "progress.skills.$.completed": completed,
                        "progress.totalSkills": total,
                        "progress.completedSkills": completedCount,
                        "progress.percentage": percentage,
                        "progress.lastUpdated": Date.now()
                    }
                },
                { new: true } // Return updated doc
            );
        } else {
            // Skill does not exist: Push new + Update Stats
            const total = skills.length + 1;
            const completedCount = skills.filter(s => s.completed).length + (completed ? 1 : 0);
            const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

            updatedRoadmap = await Roadmap.findOneAndUpdate(
                { _id: id, user: userId },
                {
                    $push: { "progress.skills": { name: skillName, completed } },
                    $set: {
                        "progress.totalSkills": total,
                        "progress.completedSkills": completedCount,
                        "progress.percentage": percentage,
                        "progress.lastUpdated": Date.now()
                    }
                },
                { new: true }
            );
        }

        if (!updatedRoadmap) {
            return res.status(500).json({ error: 'Failed to update progress.' });
        }

        res.status(200).json(updatedRoadmap);
    } catch (error) {
        console.error('Error updating progress:', error);
        next(error);
    }
};
