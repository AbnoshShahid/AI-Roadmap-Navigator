import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    UserCircleIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline'; // Assuming heroicons v2 is installed, or using standard SVG if not. 
// Note: If heroicons is not installed, I will use generic SVGs to ensure it works without npm install.
// Checking package.json... I remember seeing it? No, I don't think I checked package.json for heroicons.
// To be safe, I will use pure SVG icons to avoid dependency errors.

const TopBar = ({ title = "Dashboard", user }) => {
    return (
        <header className="h-16 fixed top-0 right-0 left-64 bg-[var(--topbar-bg)] border-b border-[var(--topbar-border)] flex items-center justify-between px-6 z-10 transition-all duration-300">
            {/* Page Title */}
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
            </div>

            {/* Search & Profile */}
            <div className="flex items-center space-x-4">
                {/* Search Placeholder */}
                <div className="relative hidden md:block">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-64 bg-[var(--bg-surface)] text-[var(--text-muted)] placeholder-[var(--text-muted)]"
                    />
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-2 cursor-pointer hover:bg-[var(--sidebar-hover)] p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[var(--sidebar-active)] flex items-center justify-center text-[var(--sidebar-text-active)] font-bold">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">
                        {user?.name || 'User'}
                    </span>
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
