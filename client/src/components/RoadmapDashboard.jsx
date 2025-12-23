import React, { useEffect, useState } from 'react';
import { getAllRoadmaps } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RoadmapDashboard = ({ onViewRoadmap, onCreateNew }) => {
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
                <h1 className="text-3xl font-bold text-gray-800">Student Dashboard 🎓</h1>
                <button
                    onClick={onCreateNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    + Create New Roadmap
                </button>
            </div>

            {roadmaps.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg mb-4">No roadmaps saved yet.</p>
                    <button
                        onClick={onCreateNew}
                        className="text-blue-600 hover:underline"
                    >
                        Start your first career path
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map((roadmap) => {
                        // Dynamic Progress Calculation
                        const skills = roadmap.progress?.skills || [];
                        const total = skills.length;
                        const completed = skills.filter(s => s.completed).length;
                        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                        return (
                            <div key={roadmap._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100 flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{roadmap.role}</h3>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                            {roadmap.education}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Created: {new Date(roadmap.createdAt).toLocaleDateString()}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
                                            <span>Progress</span>
                                            <span>{percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
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

                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={() => onViewRoadmap(roadmap)}
                                        className="w-full py-2 bg-white border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100 transition"
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
