import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AnalyticsDashboard = ({ roadmapId, API_URL }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!roadmapId) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/evaluation/${roadmapId}`);
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [roadmapId, API_URL]);

    if (loading) return <div className="text-sm text-gray-500">Loading analytics...</div>;
    if (!stats || !roadmapId) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'On Track': return 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]';
            case 'Stalled': return 'bg-[var(--accent)]/10 text-[var(--accent)]';
            case 'Needs Attention': return 'bg-[var(--secondary)]/10 text-[var(--secondary)]';
            default: return 'bg-[var(--bg-main)] text-[var(--text-muted)]';
        }
    };

    return (
        <div className="bg-[var(--bg-surface)] p-6 rounded-lg shadow-md animate-fade-in mt-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">📊 Learning Analytics</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--bg-main)] p-4 rounded-lg border border-[var(--border-color)] text-center">
                    <p className="text-[var(--text-muted)] text-xs font-semibold uppercase">Completion Rate</p>
                    <p className="text-3xl font-bold text-[var(--secondary)]">{stats.completionRate}%</p>
                </div>

                <div className="bg-[var(--bg-main)] p-4 rounded-lg border border-[var(--border-color)] text-center">
                    <p className="text-[var(--text-muted)] text-xs font-semibold uppercase">Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(stats.status)}`}>
                        {stats.status}
                    </span>
                </div>

                <div className="bg-[var(--bg-main)] p-4 rounded-lg border border-[var(--border-color)] text-center">
                    <p className="text-[var(--text-muted)] text-xs font-semibold uppercase">Skills Mastered</p>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.completedSkillsCount}</p>
                </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
                Last Evaluated: {new Date(stats.lastUpdated).toLocaleDateString()}
            </p>
        </div>
    );
};

export default AnalyticsDashboard;
