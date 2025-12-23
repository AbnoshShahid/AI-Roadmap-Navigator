import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { updateRoadmapProgress, initializeRoadmapProgress } from '../services/api';

const ProgressTracker = ({ roadmap, onBack }) => {
    const [progress, setProgress] = useState(roadmap.progress || { skills: [], percentage: 0 });
    const [skillsList, setSkillsList] = useState([]);
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
        const init = async () => {
            // Initialize local state from roadmap prop
            if (roadmap && roadmap.progress) {
                setProgress(roadmap.progress);
                if (roadmap.progress.skills && roadmap.progress.skills.length > 0) {
                    setSkillsList(roadmap.progress.skills);
                } else if (!isInitializing) {
                    // AUTO-FIX: If no skills, call backend to initialize
                    console.log("No skills found. Triggering AI initialization...");
                    setIsInitializing(true);
                    const toastId = toast.loading('Analysing roadmap to extract trackable skills...');

                    try {
                        const result = await initializeRoadmapProgress(roadmap._id);
                        if (result.roadmap && result.roadmap.progress) {
                            setProgress(result.roadmap.progress);
                            setSkillsList(result.roadmap.progress.skills || []);
                            toast.success('Skills extracted successfully!', { id: toastId });
                        }
                    } catch (error) {
                        console.error(error);
                        toast.error('Failed to extract skills. Try refreshing.', { id: toastId });
                    } finally {
                        setIsInitializing(false);
                    }
                }
            } else if (!isInitializing) {
                // Even if progress obj is missing entirely
                setIsInitializing(true);
                // ... same logic potentially needed here if roadmap.progress is undefined
            }
        };
        init();
    }, [roadmap]);

    const handleToggleSkill = async (skillName, currentStatus) => {
        const newStatus = !currentStatus;

        // 1. Optimistic UI Update
        const updatedSkills = skillsList.map(s =>
            s.name === skillName ? { ...s, completed: newStatus } : s
        );
        const completedCount = updatedSkills.filter(s => s.completed).length;
        const total = updatedSkills.length;
        const newPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        setSkillsList(updatedSkills);
        setProgress(prev => ({ ...prev, percentage: newPercentage, completedSkills: completedCount }));

        // 2. API Call
        try {
            await updateRoadmapProgress(roadmap._id, {
                skillName,
                completed: newStatus
            });
            // Success silent, or small toast? SIlent is better for toggles.
        } catch (error) {
            console.error(error);
            toast.error('Failed to save progress');
            // Revert on failure
            setSkillsList(skillsList);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in">
            <button
                onClick={onBack}
                className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
                ← Back to Dashboard
            </button>

            <div className="bg-[var(--bg-surface)] rounded-xl shadow-lg border border-[var(--border-color)] p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{roadmap.role}</h1>
                        <p className="text-gray-500">Track your journey to mastery</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-blue-600">{progress.percentage}%</div>
                        <div className="text-sm text-gray-400">Completed</div>
                    </div>
                </div>

                {/* Main Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-4 mb-8 overflow-hidden">
                    <div
                        className="bg-blue-600 h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress.percentage}%` }}
                    ></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Skills List */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Skills Checklist</h3>
                        {skillsList.length === 0 ? (
                            <p className="text-gray-400 italic">No trackable skills found.</p>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {skillsList.map((skill, idx) => (
                                    <label
                                        key={idx}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer select-none
                                            ${skill.completed
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-[var(--accent)]'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition
                                            ${skill.completed ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-[var(--bg-surface)] border-[var(--border-color)]'}`}>
                                            {skill.completed && (
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={skill.completed}
                                            onChange={() => handleToggleSkill(skill.name, skill.completed)}
                                            className="hidden"
                                        />
                                        <span className={`flex-1 font-medium ${skill.completed ? 'text-blue-800' : 'text-gray-700'}`}>
                                            {skill.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProgressTracker;
