import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon,
    MapIcon,
    BookmarkSquareIcon,
    ChartBarIcon,
    UserIcon,
    PlusCircleIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ currentView, onChangeView }) => {
    const { logout } = useAuth();

    // Mapping User Features to App.jsx Views
    // Dashboard -> "dashboard"
    // Roadmaps -> "dashboard" (List of roadmaps)
    // Saved Roadmaps -> "dashboard" (Also list)
    // Progress -> "skills"
    // Profile -> "profile"
    // New Roadmap -> "form"

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, view: 'dashboard' },
        { id: 'roadmaps', label: 'Roadmaps', icon: MapIcon, view: 'roadmaps' },
        { id: 'saved_roadmaps', label: 'Saved Roadmaps', icon: BookmarkSquareIcon, view: 'saved_roadmaps' },
        { id: 'skills', label: 'Progress', icon: ChartBarIcon, view: 'skills' },
        { id: 'profile', label: 'Profile', icon: UserIcon, view: 'profile' },
        { id: 'form', label: 'New Roadmap', icon: PlusCircleIcon, view: 'form' },
    ];

    return (
        <div className="w-64 fixed h-screen bg-[var(--sidebar-bg)] flex flex-col justify-between z-20 shadow-xl border-r border-gray-200/20">
            {/* Logo Section */}
            <div className="p-8">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-[var(--secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-lg font-extrabold text-[var(--sidebar-text)] tracking-wide leading-tight">
                        AI Roadmap Navigator
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const targetView = item.view || item.id;
                    const isActive = currentView === targetView;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeView(targetView)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text-active)] font-bold shadow-md transform scale-[1.02]'
                                    : 'text-[var(--sidebar-text)]/80 hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] hover:translate-x-1'
                                }`}
                        >
                            <item.icon
                                className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-[var(--sidebar-text-active)] scale-110' : 'text-[var(--accent)] group-hover:text-[var(--text-primary)] opacity-90'}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="tracking-wide">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-6 border-t border-gray-200/10">
                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] rounded-xl transition-all duration-200 group"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Log out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
