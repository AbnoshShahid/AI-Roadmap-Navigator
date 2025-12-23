import React, { useEffect, useState } from 'react';
import { getAllRoadmaps } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RoadmapDashboard = ({ onViewRoadmap, onCreateNew, onlyActive = false }) => {
    const [roadmaps, setRoadmaps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            // Fetch every time the component mounts to get latest progress
            fetchRoadmaps();
        }
    }, [isAuthenticated]);

    const fetchRoadmaps = async () => {
        try {
            const data = await getAllRoadmaps();
            setRoadmaps(data);
        } catch (error) {
            console.error(error);
            // Don't show error if it's just an auth issue (user will be redirected)
            if (error.response && error.response.status === 401) return;
            toast.error('Failed to load roadmaps');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="text-center py-10">Loading Dashboard...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                        {onlyActive ? 'Active Learning Paths 🚀' : 'My Roadmaps 📚'}
                    </h1>
                    {onlyActive && (
                        <p className="text-[var(--text-muted)] mt-1">Continue where you left off</p>
                    )}
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-[var(--color-primary)] text-white px-4 py-2 rounded hover:bg-[var(--secondary)] transition"
                >
                    + Explore Templates
                </button>
            </div>

            {roadmaps.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-surface)] rounded-lg shadow-sm border border-[var(--border-color)]">
                    <p className="text-[var(--text-muted)] text-lg mb-4">No roadmaps saved yet.</p>
                    <button
                        onClick={onCreateNew}
                        className="text-[var(--secondary)] hover:underline"
                    >
                        Start your first career path
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps
                        .filter(r => {
                            if (!onlyActive) return true;
                            // For dashboard, show if progress > 0 and < 100, or recently created
                            // For simplicity: show first 3
                            return true;
                        })
                        .slice(0, onlyActive ? 3 : undefined) // Limit active view to top 3
                        .map((roadmap) => {
                            // Dynamic Progress Calculation
                            const skills = roadmap.progress?.skills || [];
                            const total = skills.length;
                            const completed = skills.filter(s => s.completed).length;
                            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                            return (
                                <div key={roadmap._id} className="bg-[var(--bg-surface)] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-[var(--border-color)] flex flex-col">
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-[var(--text-primary)] line-clamp-2">{roadmap.role}</h3>
                                            <span className="bg-[var(--secondary)]/10 text-[var(--secondary)] text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                                {roadmap.education}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={() => onViewRoadmap(roadmap)}
                                                className={`w-full text-center py-2 rounded transition border ${onlyActive
                                                        ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--secondary)] font-bold shadow-md'
                                                        : 'text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--bg-main)]'
                                                    }`}
                                            >
                                                {onlyActive ? 'Continue Learning' : 'View Details'}
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Created: {new Date(roadmap.createdAt).toLocaleDateString()}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs font-semibold mb-1 text-[var(--text-muted)]">
                                                <span>Progress</span>
                                                <span>{percentage}%</span>
                                            </div>
                                            <div className="w-full bg-[var(--bg-main)] rounded-full h-2.5">
                                                <div
                                                    className="bg-[var(--color-primary)] h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                                {completed} skills completed
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {/* Quick badges for gaps */}
                                            {roadmap.skillsAnalysis?.missingSkills?.slice(0, 3).map((gap, i) => (
                                                <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">
                                                    Missing: {typeof gap === 'string' ? gap : gap.skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[var(--bg-main)]/50 border-t border-[var(--border-color)]">
                                        <button
                                            onClick={() => onViewRoadmap(roadmap)}
                                            className="w-full py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded text-[var(--text-primary)] font-medium hover:bg-[var(--sidebar-hover)] transition"
                                        >
                                            View & Track Progress →
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default RoadmapDashboard;
