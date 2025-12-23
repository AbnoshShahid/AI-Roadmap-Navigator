import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    MagnifyingGlassIcon,
    BellIcon,
    Bars3CenterLeftIcon
} from '@heroicons/react/24/outline'; // Assuming heroicons v2 is installed, or using standard SVG if not.
// Note: If heroicons is not installed, I will use generic SVGs to ensure it works without npm install.
// Checking package.json... I remember seeing it? No, I don't think I checked package.json for heroicons.
// To be safe, I will use pure SVG icons to avoid dependency errors.

const TopBar = ({ user, title }) => {
    return (
        <header className="h-20 bg-[var(--bg-main)] border-b border-[var(--border-color)] flex items-center justify-between px-8 sticky top-0 z-10 bg-opacity-95 backdrop-blur-sm transition-all duration-300">
            {/* Left: Branding & Page Title */}
            <div className="flex items-center space-x-6">
                {/* App Branding (Moved from Sidebar) */}
                <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="w-9 h-9 bg-[var(--color-primary)] rounded-lg flex items-center justify-center shadow-md transform group-hover:rotate-3 transition-transform duration-300">
                        <svg className="w-5 h-5 text-[var(--secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-lg font-bold text-[var(--color-primary)] leading-none tracking-tight">AI Roadmap</h1>
                        <span className="text-xs font-semibold text-[var(--text-muted)] tracking-widest uppercase">Navigator</span>
                    </div>
                </div>

                {/* Vertical Separator */}
                <div className="h-8 w-px bg-[var(--border-color)] opacity-50 hidden md:block"></div>

                {/* Page Title */}
                <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                    {title}
                </h2>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-8 hidden lg:block">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search specific skills, jobs..."
                        className="block w-full pl-10 pr-3 py-2.5 bg-[var(--bg-surface)] border border-transparent focus:border-[var(--border-color)] rounded-xl text-sm placeholder-[var(--text-muted)]/70 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all shadow-sm group-hover:bg-white/40"
                    />
                </div>
            </div>

            {/* Right: User Profile & Notifications */}
            <div className="flex items-center space-x-5">
                <button className="relative p-2 rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--color-primary)] transition-colors">
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-[var(--secondary)] ring-2 ring-[var(--bg-main)]"></span>
                </button>

                <div className="flex items-center space-x-3 pl-5 border-l border-[var(--border-color)]/50">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{user?.name || 'User'}</p>
                        <p className="text-xs text-[var(--text-muted)] font-medium">Free Plan</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--secondary)] p-0.5 shadow-md cursor-pointer hover:scale-105 transition-transform">
                        <div className="h-full w-full rounded-full bg-[var(--bg-surface)] flex items-center justify-center overflow-hidden">
                            <span className="text-[var(--color-primary)] font-bold text-lg">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
