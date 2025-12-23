import React, { useState } from 'react';
import {
    AcademicCapIcon,
    CodeBracketIcon,
    ChartBarIcon,
    PaintBrushIcon,
    ServerIcon,
    CpuChipIcon,
    PlusIcon,
    XMarkIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { saveRoadmap } from '../services/api';

const MOCK_TEMPLATES = [
    {
        id: 'ai-beginner',
        role: 'AI Engineer',
        level: 'Beginner',
        duration: '3 months',
        description: 'Learn the basics of AI and machine learning. Start your journey as an AI engineer.',
        icon: CpuChipIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        roadmapData: {
            roadmap: [
                {
                    phase: "Phase 1: Foundations",
                    description: "Mathematics and Python basics",
                    subjects: ["Linear Algebra", "Calculus", "Python Programming", "NumPy & Pandas"]
                },
                {
                    phase: "Phase 2: ML Basics",
                    description: "Introduction to Machine Learning algorithms",
                    subjects: ["Supervised Learning", "Unsupervised Learning", "Scikit-learn", "Model Evaluation"]
                },
                {
                    phase: "Phase 3: Deep Learning Intro",
                    description: "Neural Networks and Basic Deep Learning",
                    subjects: ["Neural Networks", "TensorFlow/PyTorch Basics", "Simple Projects"]
                }
            ],
            skills: ["Python", "Mathematics", "Machine Learning", "Data Analysis"]
        }
    },
    {
        id: 'frontend-dev',
        role: 'Frontend Developer',
        level: 'Beginner',
        duration: '6 months',
        description: 'Master HTML, CSS, and JavaScript to build modern web applications.',
        icon: CodeBracketIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        roadmapData: {
            roadmap: [
                {
                    phase: "Phase 1: The Web Trio",
                    description: "HTML, CSS, and JavaScript fundamentals",
                    subjects: ["HTML5", "CSS3", "JavaScript ES6+", "DOM Manipulation"]
                },
                {
                    phase: "Phase 2: React Ecosystem",
                    description: "Modern frontend development with React",
                    subjects: ["React Hooks", "State Management", "Routing", "API Integration"]
                },
                {
                    phase: "Phase 3: Advanced UI",
                    description: "Styling and performance",
                    subjects: ["TailwindCSS", "Animations", "Performance Optimization", "Accessibility"]
                }
            ],
            skills: ["HTML", "CSS", "JavaScript", "React", "TailwindCSS"]
        }
    },
    {
        id: 'mern-stack',
        role: 'Full Stack MERN',
        level: 'Intermediate',
        duration: '6 months',
        description: 'Become a full stack developer using MongoDB, Express, React, and Node.js.',
        icon: ServerIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        roadmapData: {
            roadmap: [
                {
                    phase: "Phase 1: Frontend (React)",
                    description: "Building the user interface",
                    subjects: ["React", "Redux", "Hooks", "Responsive Design"]
                },
                {
                    phase: "Phase 2: Backend (Node/Express)",
                    description: "Server-side logic and APIs",
                    subjects: ["Node.js", "Express.js", "RESTful APIs", "Authentication"]
                },
                {
                    phase: "Phase 3: Database & Deployment",
                    description: "Data persistence and hosting",
                    subjects: ["MongoDB", "Mongoose", "Deployment (Vercel/Heroku)", "CI/CD"]
                }
            ],
            skills: ["MongoDB", "Express", "React", "Node.js", "REST API"]
        }
    },
    {
        id: 'ai-advanced',
        role: 'AI Engineer',
        level: 'Advanced',
        duration: '6 months',
        description: 'Dive deep into neural networks, NLP, and deep learning models.',
        icon: CpuChipIcon,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        roadmapData: {
            roadmap: [
                {
                    phase: "Phase 1: Advanced Deep Learning",
                    description: "Complex architectures and optimization",
                    subjects: ["CNNs", "RNNs/LSTMs", "Transformers", "Hyperparameter Tuning"]
                },
                {
                    phase: "Phase 2: NLP & Computer Vision",
                    description: "Specialized AI domains",
                    subjects: ["Natural Language Processing", "Computer Vision", "Generative AI", "LLMs"]
                },
                {
                    phase: "Phase 3: MLOps",
                    description: "Productionizing AI models",
                    subjects: ["Model Deployment", "Docker", "Model Monitoring", "Cloud AI Services"]
                }
            ],
            skills: ["Deep Learning", "NLP", "Computer Vision", "PyTorch", "MLOps"]
        }
    },
    {
        id: 'ui-ux',
        role: 'UI/UX Designer',
        level: 'Beginner',
        duration: '3 months',
        description: 'Learn the fundamentals of user interface and user experience design.',
        icon: PaintBrushIcon,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        roadmapData: {
            roadmap: [
                {
                    phase: "Phase 1: UX Fundamentals",
                    description: "Research and user psychology",
                    subjects: ["User Research", "Personas", "User Journeys", "Wireframing"]
                },
                {
                    phase: "Phase 2: UI Design",
                    description: "Visual design and prototyping",
                    subjects: ["Typography", "Color Theory", "Figma", "Prototyping"]
                },
                {
                    phase: "Phase 3: Testing & Handoff",
                    description: "Validation and developer collaboration",
                    subjects: ["Usability Testing", "Design Systems", "Developer Handoff"]
                }
            ],
            skills: ["Figma", "User Research", "Prototyping", "Wireframing", "UI Design"]
        }
    },
    {
        id: 'data-analyst',
        role: 'Data Analyst',
        level: 'Beginner',
        duration: '4 months',
        description: 'Learn to analyze data, create visualizations, and drive business decisions.',
        icon: ChartBarIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        roadmapData: {
            roadmap: [
                {
                    phase: "Phase 1: Data Basics",
                    description: "Excel and SQL",
                    subjects: ["Excel (Advanced)", "SQL Basics", "Database Design", "Data Cleaning"]
                },
                {
                    phase: "Phase 2: Analysis & Viz",
                    description: "Python and Visualization tools",
                    subjects: ["Python for Data", "Tableau/PowerBI", "Data Storytelling"]
                },
                {
                    phase: "Phase 3: Statistics",
                    description: "Statistical methods",
                    subjects: ["Descriptive Stats", "Inferential Stats", "A/B Testing"]
                }
            ],
            skills: ["SQL", "Excel", "Data Visualization", "Python", "Statistics"]
        }
    }
];

const RoadmapTemplates = ({ onTemplateAdded }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [addingId, setAddingId] = useState(null);

    const handleAddToMyRoadmaps = async (template) => {
        setAddingId(template.id);
        const toastId = toast.loading('Adding to your roadmaps...');

        try {
            // Construct payload compatible with saveRoadmap API
            const payload = {
                userSummary: {
                    role: template.role,
                    education: 'Self-Paced',
                    currentSkills: 'Beginner', // Default assumption for templates
                    interests: `Interested in ${template.role}`
                },
                jobSuggestions: [
                    { title: template.role, description: 'Matched via Template' }
                ],
                skillsAnalysis: {
                    requiredSkills: [],
                    existingSkills: [],
                    missingSkills: template.roadmapData.skills,
                    matchPercentage: 0
                },
                roadmap: template.roadmapData.roadmap
            };

            await saveRoadmap(payload);
            toast.success('Added to your roadmaps!', { id: toastId });

            // Close modal if open
            setSelectedTemplate(null);

            // Notify parent to switch view or refresh
            if (onTemplateAdded) onTemplateAdded();

        } catch (error) {
            console.error(error);
            toast.error('Failed to add roadmap.', { id: toastId });
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 animate-fade-in">
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-[var(--color-primary)] rounded-lg">
                        <AcademicCapIcon className="w-6 h-6 text-[var(--secondary)]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Explore Paths</h1>
                </div>
                <p className="text-[var(--text-muted)] text-lg">
                    Discover expert-curated learning paths to kickstart your career.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_TEMPLATES.map((template) => (
                    <div
                        key={template.id}
                        className="bg-[var(--bg-surface)] rounded-xl shadow-md border border-[var(--border-color)] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
                        onClick={() => setSelectedTemplate(template)}
                    >
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <template.icon className={`w-10 h-10 ${template.color} bg-white rounded-lg p-1.5 shadow-sm`} />
                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${template.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                                        template.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {template.level}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                                {template.role}
                            </h3>
                            <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-4">
                                {template.description}
                            </p>

                            <div className="flex items-center text-xs font-medium text-[var(--text-muted)] space-x-4">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {template.duration}
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    {template.roadmapData.roadmap.length} Phases
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-[var(--bg-main)]/50 border-t border-[var(--border-color)]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToMyRoadmaps(template);
                                }}
                                disabled={addingId === template.id}
                                className="w-full py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--secondary)] font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2"
                            >
                                {addingId === template.id ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-4 h-4" />
                                        <span>Add to My Roadmaps</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--border-color)]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-start bg-[var(--bg-main)]">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                    {selectedTemplate.role}
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${selectedTemplate.level === 'Beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                                            selectedTemplate.level === 'Intermediate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                        {selectedTemplate.level}
                                    </span>
                                </h2>
                                <p className="text-[var(--text-muted)] mt-1">{selectedTemplate.description}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="p-2 hover:bg-black/5 rounded-full text-[var(--text-muted)] transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {selectedTemplate.roadmapData.roadmap.map((phase, idx) => (
                                <div key={idx} className="relative pl-6 border-l-2 border-[var(--border-color)]">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-surface)]"></div>
                                    <h4 className="text-lg font-bold text-[var(--color-primary)] mb-1">{phase.phase}</h4>
                                    <p className="text-sm text-[var(--text-muted)] mb-3 italic">{phase.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {phase.subjects.map((sub, sIdx) => (
                                            <span key={sIdx} className="px-2.5 py-1 bg-white text-[var(--text-primary)] text-xs font-medium rounded-md shadow-sm border border-gray-100">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-main)] flex justify-end space-x-3">
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="px-5 py-2.5 rounded-lg text-[var(--text-muted)] hover:bg-black/5 font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleAddToMyRoadmaps(selectedTemplate)}
                                disabled={addingId === selectedTemplate.id}
                                className="px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--secondary)] font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                {addingId === selectedTemplate.id ? 'Adding...' : 'Start This Roadmap Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadmapTemplates;
