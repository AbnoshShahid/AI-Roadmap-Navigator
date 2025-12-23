import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/api';
import toast from 'react-hot-toast';

const RoadmapHistory = ({ onView }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const data = await getHistory();
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch history', error);
            // Optional: don't toast on load failure to avoid annoyance if DB is off
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    if (loading) return <div className="text-center py-4 text-gray-500">Loading history...</div>;
    if (!history.length) return null;

    return (
        <div className="max-w-4xl mx-auto mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Previous Roadmaps</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {history.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded-lg shadow border border-gray-100 hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-lg text-blue-600 mb-1">{item.role}</h4>
                        <p className="text-sm text-gray-500 mb-2">{new Date(item.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400 truncate mb-4">Skills: {item.skills.join(', ')}</p>
                        <button
                            onClick={() => onView(item)}
                            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded"
                        >
                            View Roadmap
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoadmapHistory;
