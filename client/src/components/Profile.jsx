import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-2xl mx-auto p-8 animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 mt-10">
            <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-4xl">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                    <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Student Account Active
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Member Since</label>
                        <p className="text-gray-900 mt-1">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Account Type</label>
                        <p className="text-gray-900 mt-1">Standard</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">🚀 Learning Journey</h4>
                <p className="text-sm text-blue-700">
                    Keep creating roadmaps and tracking your skills. Your progress helps our AI recommend better career paths for you!
                </p>
            </div>
        </div>
    );
};

export default Profile;
