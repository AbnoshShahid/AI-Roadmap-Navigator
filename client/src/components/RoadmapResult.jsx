import React from 'react';
import ProgressTracker from './ProgressTracker';
import AnalyticsDashboard from './AnalyticsDashboard';

const RoadmapResult = ({ roadmap, analysis, onReset, onSave }) => {
    // Handle both old (string) and new (object) formats for backward compatibility
    // But primarily focus on the new structure
    const data = typeof roadmap === 'string' ? null : roadmap;
    const isLegacy = typeof roadmap === 'string' || !data.userSummary;

    // Use structured data if available, otherwise fallbacks
    const userSummary = data?.userSummary || {};
    const jobSuggestions = data?.jobSuggestions || [];
    const skillsAnalysis = data?.skillsAnalysis || {};
    const phases = data?.roadmap || [];

    const roadmapId = roadmap?._id || null;
    const trackableSkills = roadmap.generatedSkills && roadmap.generatedSkills.length > 0
        ? roadmap.generatedSkills
        : (skillsAnalysis.missingSkills || []);

    const completedSkills = roadmap?.progress?.completedSkills || [];

    if (isLegacy) {
        return (
            <div className="p-6 bg-yellow-50 text-yellow-800 rounded">
                <h3 className="font-bold">Legacy Format Dectected</h3>
                <p>Please regenerate the roadmap to see the new structured view.</p>
                <div className="mt-4 whitespace-pre-wrap">{typeof roadmap === 'string' ? roadmap : roadmap.roadmap_markdown}</div>
                <button onClick={onReset} className="mt-4 text-blue-600 underline">Create New</button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

            {/* BLOCK 1: User Input Summary */}
            <div className="bg-[var(--bg-surface)] p-6 rounded-lg shadow-md border-l-4 border-[var(--secondary)]">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">👤 User Profile Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Target Role</span>
                        <p className="font-semibold text-[var(--color-primary)]">{userSummary.role}</p>
                    </div>
                    <div>
                        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Education</span>
                        <p className="font-medium text-[var(--text-primary)]">{userSummary.education}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Current Skills</span>
                        <p className="font-medium text-gray-700">{userSummary.currentSkills}</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Interests</span>
                        <p className="font-medium text-gray-700">{userSummary.interests}</p>
                    </div>
                </div>
            </div>

            {/* BLOCK 2: AI Job Suggestions */}
            <div className="bg-gradient-to-r from-[var(--bg-main)] to-[var(--bg-surface)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[var(--secondary)]">🤖 AI Career Suggestions</h2>
                    {analysis?.mlRecommendations?.[0]?.meta && (
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded font-mono">
                            ML Model: {analysis.mlRecommendations[0].meta.model_version}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobSuggestions.map((job, idx) => (
                        <div key={idx} className="bg-[var(--bg-surface)] p-4 rounded border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-[var(--color-primary)]">{job.title}</h3>
                            <p className="text-sm text-[var(--text-muted)] mt-1">{job.description}</p>
                        </div>
                    ))}
                    {/* Fallback for pure ML service recommendations if Groq list is empty */}
                    {!jobSuggestions.length && analysis?.mlRecommendations?.map((rec, idx) => (
                        <div key={'ml-' + idx} className="bg-[var(--bg-surface)] p-4 rounded border border-[var(--border-color)]">
                            <h3 className="font-bold text-[var(--color-primary)]">{rec.role}</h3>
                            <p className="text-sm text-[var(--text-muted)]">{(rec.confidence * 100).toFixed(0)}% Match Confidence</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* BLOCK 3: Skill Gap Analysis */}
            <div className="bg-[var(--bg-main)] p-6 rounded-lg shadow-md border-l-4 border-[var(--accent)]">
                <h2 className="text-xl font-bold text-[var(--accent)] mb-4">📊 Skills Gap Analysis</h2>
                <div className="flex flex-wrap gap-6 mb-4">
                    <div className="bg-[var(--bg-surface)] px-4 py-2 rounded shadow-sm">
                        <span className="block text-xs text-[var(--text-muted)]">Required Skills</span>
                        <span className="text-xl font-bold text-[var(--text-primary)]">{skillsAnalysis.requiredSkills?.length || 0}</span>
                    </div>
                    <div className="bg-[var(--bg-surface)] px-4 py-2 rounded shadow-sm">
                        <span className="block text-xs text-[var(--text-muted)]">You Have</span>
                        <span className="text-xl font-bold text-[var(--color-primary)]">{skillsAnalysis.existingSkills?.length || 0}</span>
                    </div>
                    <div className="bg-[var(--bg-surface)] px-4 py-2 rounded shadow-sm">
                        <span className="block text-xs text-[var(--text-muted)]">Missing</span>
                        <span className="text-xl font-bold text-[var(--accent)]">{skillsAnalysis.missingSkills?.length || 0}</span>
                    </div>
                    {skillsAnalysis.matchPercentage !== undefined && (
                        <div className="bg-[var(--bg-surface)] px-4 py-2 rounded shadow-sm">
                            <span className="block text-xs text-[var(--text-muted)]">Match Score</span>
                            <span className="text-xl font-bold text-[var(--secondary)]">{skillsAnalysis.matchPercentage}%</span>
                        </div>
                    )}
                </div>

                {skillsAnalysis.missingSkills?.length > 0 && (
                    <div>
                        <p className="text-sm font-semibold text-[var(--text-muted)] mb-2">Recommended to Learn:</p>
                        <div className="flex flex-wrap gap-2">
                            {skillsAnalysis.missingSkills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded border border-red-200">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* BLOCK 4: Time-Based Roadmap */}
            <div className="bg-[var(--bg-surface)] p-6 rounded-lg shadow-lg border-t-4 border-[var(--color-primary)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Your Personalized Roadmap</h2>
                    <div className="space-x-3">
                        <button
                            onClick={() => {
                                // Construct the precise payload expected by the backend
                                const payload = {
                                    userSummary: data?.userSummary || {},
                                    jobSuggestions: data?.jobSuggestions || [],
                                    skillsAnalysis: data?.skillsAnalysis || {},
                                    roadmap: data?.roadmap || []
                                };
                                onSave(payload);
                            }}
                            className="text-sm bg-[var(--color-primary)] text-white hover:bg-[var(--secondary)] py-2 px-4 rounded transition-colors"
                        >
                            Save Roadmap
                        </button>
                        <button
                            onClick={onReset}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            Create New
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {phases.map((phase, idx) => (
                        <div key={idx} className="relative pl-8 border-l-2 border-[var(--border-color)] pb-2">
                            <div className="absolute -left-2 top-0 w-4 h-4 bg-[var(--color-primary)] rounded-full border-2 border-white shadow-sm"></div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{phase.phase}</h3>
                            <p className="text-sm text-[var(--text-muted)] italic mb-3">{phase.focus || phase.goals}</p>

                            <div className="mb-3">
                                <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Focus Skills:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {phase.skills.map((s, i) => (
                                        <span key={i} className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs rounded border border-[var(--color-primary)]/20">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {phase.projects?.length > 0 && (
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Projects:</span>
                                    <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                                        {phase.projects.map((p, i) => (
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Optional Analytics (only if saved) */}
            {roadmapId && (
                <div className="pt-8 border-t border-gray-200">
                    <AnalyticsDashboard
                        roadmapId={roadmapId}
                        API_URL={(import.meta.env.VITE_API_URL || 'http://localhost:5000')}
                    />
                </div>
            )}
        </div>
    );
};

export default RoadmapResult;
