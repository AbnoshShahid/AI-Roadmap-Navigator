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
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-[var(--bg-surface)] rounded-lg shadow-md space-y-6 border border-[var(--border-color)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Create Your Career Roadmap</h2>

            <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Target Career Role</label>
                <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Full Stack Developer"
                    className="w-full p-2 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[var(--accent)] outline-none bg-[var(--bg-main)] text-[var(--text-primary)]"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Education Level</label>
                <select
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[var(--accent)] outline-none bg-[var(--bg-main)] text-[var(--text-primary)]"
                >
                    <option value="">Select Education</option>
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Self-Taught">Self-Taught</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Current Skills (comma separated)</label>
                <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. JavaScript, HTML, Python"
                    className="w-full p-2 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[var(--accent)] outline-none h-24 bg-[var(--bg-main)] text-[var(--text-primary)]"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Interests</label>
                <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g. AI, Web Design, Data Security"
                    className="w-full p-2 border border-[var(--border-color)] rounded-md focus:ring-2 focus:ring-[var(--accent)] outline-none bg-[var(--bg-main)] text-[var(--text-primary)]"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-md text-[var(--text-light)] font-medium transition-colors ${isLoading ? 'bg-[var(--accent)] cursor-not-allowed' : 'bg-[var(--color-primary)] hover:bg-[var(--secondary)]'
                    }`}
            >
                {isLoading ? 'Generating Roadmap...' : 'Generate Roadmap'}
            </button>
        </form>
    );
};

export default CareerForm;
