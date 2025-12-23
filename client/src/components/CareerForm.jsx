import React, { useState } from 'react';

const CareerForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        education: '',
        skills: '',
        interests: '',
        role: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Split skills by comma
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
        onSubmit({ ...formData, skills: skillsArray });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Your Career Roadmap</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Career Role</label>
                <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Full Stack Developer"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">Select Education</option>
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Self-Taught">Self-Taught</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Skills (comma separated)</label>
                <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. JavaScript, HTML, Python"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-24"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g. AI, Web Design, Data Security"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isLoading ? 'Generating Roadmap...' : 'Generate Roadmap'}
            </button>
        </form>
    );
};

export default CareerForm;
