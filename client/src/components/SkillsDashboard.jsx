import React, { useEffect, useState } from 'react';
import { getAllRoadmaps } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SkillsDashboard = () => {
    const [skillsMap, setSkillsMap] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchSkills();
        }
    }, [isAuthenticated]);

    const fetchSkills = async () => {
        try {
            const roadmaps = await getAllRoadmaps();
            const allSkills = new Set();
            const completed = new Set();

            roadmaps.forEach(r => {
                // Collect completed skills
                if (r.progress?.completedSkills) {
                    r.progress.completedSkills.forEach(s => completed.add(s));
                }

                // Collect all suggested gap skills (and maybe regex parse potential skills from roadmap text? No, too complex. Just sticky gaps + completed)
                if (r.skillGaps) {
                    r.skillGaps.forEach(g => allSkills.add(g.skill));
                }
            });

            // Convert to array
            setSkillsMap({
                mastered: Array.from(completed),
                suggested: Array.from(allSkills).filter(s => !completed.has(s))
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading Skills...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Skill Acquisition Matrix 🧠</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Mastered Skills */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-green-800">Mastered Skills</h3>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                            {skillsMap.mastered?.length || 0}
                        </span>
                    </div>
                    {skillsMap.mastered?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {skillsMap.mastered.map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-md border border-green-100 text-sm">
                                    ✅ {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm italic">No skills marked as completed yet.</p>
                    )}
                </div>

                {/* Suggested / To Learn */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-blue-800">Target Skills</h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                            {skillsMap.suggested?.length || 0}
                        </span>
                    </div>
                    {skillsMap.suggested?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {skillsMap.suggested.map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100 text-sm">
                                    🎯 {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm italic">No active learning targets.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillsDashboard;
