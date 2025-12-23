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

const Sidebar = ({ currentView, onChangeView, isExpanded, toggleSidebar }) => {
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
        <div
            className={`fixed h-screen bg-[var(--sidebar-bg)] flex flex-col justify-between z-20 shadow-xl border-r border-gray-200/20 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}
            onMouseEnter={() => !isExpanded && toggleSidebar()}
            onMouseLeave={() => isExpanded && toggleSidebar()}
        >
            {/* Toggle / Header Section */}
            <div className="h-16 flex items-center justify-center border-b border-white/10">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] transition-colors"
                >
                    {isExpanded ? (
                        <ArrowLeftOnRectangleIcon className="w-6 h-6 transform rotate-180" />
                    ) : (
                        <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-[var(--secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    )}
                </button>
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
                            className={`w-full flex items-center px-4 py-3 mb-1 transition-all duration-200 group relative
                                ${isActive
                                    ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-text-active)]'
                                    : 'text-[var(--sidebar-text)]/80 hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
                                }
                                ${isExpanded ? 'justify-start space-x-3 mx-2 rounded-xl width-auto' : 'justify-center'}
                            `}
                        >
                            <item.icon
                                className={`transition-all duration-200 ${isActive ? 'text-[var(--sidebar-text-active)]' : 'text-[var(--accent)] group-hover:text-[var(--text-primary)]'}
                                ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}
                                `}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {isExpanded && (
                                <span className="tracking-wide font-medium whitespace-nowrap overflow-hidden animate-fade-in">
                                    {item.label}
                                </span>
                            )}
                            {!isExpanded && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--sidebar-active-bg)] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-6 border-t border-gray-200/10">
                <button
                    onClick={logout}
                    className={`w-full flex items-center px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] transition-all duration-200 group
                        ${isExpanded ? 'justify-start space-x-3 rounded-xl' : 'justify-center'}
                    `}
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {isExpanded && <span className="font-semibold">Log out</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
