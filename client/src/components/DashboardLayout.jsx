import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children, view, setView }) => {
    const { user } = useAuth();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    // Map view to title
    const getTitle = () => {
        switch (view) {
            case 'roadmaps': return 'My Roadmaps';
            case 'saved_roadmaps': return 'Saved Roadmaps';
            case 'skills': return 'Progress Tracker';
            case 'profile': return 'User Profile';
            case 'form': return 'Create New Roadmap';
            case 'roadmap': return 'Roadmap Details';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="flex h-screen bg-[var(--bg-main)] font-sans">
            {/* 1. Fixed Sidebar */}
            <Sidebar
                currentView={view}
                onChangeView={setView}
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
                        {children}
                    </div>
                </main>

                {/* 5. Footer */}
                <Footer />
            </div>
        </div >
    );
};

export default DashboardLayout;
