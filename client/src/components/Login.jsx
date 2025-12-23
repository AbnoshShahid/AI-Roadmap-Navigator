import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = ({ onSwitchToRegister }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("LOGIN BUTTON CLICKED"); // Mandatory Log

        if (loading) return;

        setLoading(true);

        // FAILSAFE: Force stop loading after 5 seconds no matter what
        const failsafeTimer = setTimeout(() => {
            setLoading(prev => {
                if (prev) {
                    toast.error("Login timed out. Please try again.");
                    return false;
                }
                return prev;
            });
        }, 5000);

        try {
            console.log("Login: calling login API...");
            await login({
                email: formData.email,
                password: formData.password
            });
            // Success logic is handled by parent App.jsx observing isAuthenticated state
        } catch (err) {
            console.error("Login: error in component", err);
        } finally {
            clearTimeout(failsafeTimer);
            setLoading(false);
        }
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen"
            style={{
                background: 'linear-gradient(135deg, #E84D88, #DA627D, #A53860, #450920)'
            }}
        >
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Sign in</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Access your roadmaps
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'}`}
                            style={{ backgroundColor: 'var(--primary)' }}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button type="button" onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:text-blue-500">
                            Register
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
