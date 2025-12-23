import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const { user } = useAuth();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const location = useLocation();

    // Map path to title
    const getTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/saved-roadmaps')) return 'My Roadmaps';
        if (path.includes('/skills')) return 'Progress Tracker';
        if (path.includes('/profile')) return 'User Profile';
        if (path.includes('/create')) return 'Create New Roadmap';
        if (path.includes('/templates')) return 'Explore Paths';
        if (path.includes('/roadmap')) return 'Roadmap Details';
        return 'Dashboard';
    };

    return (
        <div className="flex h-screen bg-[var(--bg-main)] font-sans">
            {/* 1. Fixed Sidebar */}
            <Sidebar
                isExpanded={isSidebarExpanded}
                toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
            />

            {/* 2. Main Content Wrapper */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>

                {/* 3. Fixed TopBar - positioned relatively within flex column but visually fixed */}
                <TopBar
                    user={user}
                    title={getTitle()}
                    isSidebarExpanded={isSidebarExpanded}
                />

                {/* 4. Scrollable Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pt-20 px-6 pb-6 flex flex-col">
                    <div className="max-w-7xl mx-auto w-full flex-1">
                        <Outlet />
                    </div>
                </main>

                {/* 5. Footer */}
                <Footer />
            </div>
        </div >
    );
};

export default DashboardLayout;
