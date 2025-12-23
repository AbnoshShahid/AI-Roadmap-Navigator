import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Login = () => {
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
                background: 'linear-gradient(135deg, var(--bg-main), var(--accent), var(--secondary), var(--color-primary))'
            }}
        >
            <div className="w-full max-w-md p-8 space-y-8 bg-[var(--bg-surface)] rounded shadow-md border border-[var(--border-color)]">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">Sign in</h2>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--border-color)] placeholder-[var(--text-muted)] text-[var(--text-primary)] rounded-t-md focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:z-10 sm:text-sm bg-[var(--bg-main)]"
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--border-color)] placeholder-[var(--text-muted)] text-[var(--text-primary)] rounded-b-md focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:z-10 sm:text-sm bg-[var(--bg-main)]"
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
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[var(--text-light)] ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'}`}
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-[var(--secondary)] hover:text-[var(--accent)]">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
