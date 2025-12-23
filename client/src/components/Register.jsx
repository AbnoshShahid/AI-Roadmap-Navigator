import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match"); // toast would be better but context handles API errors
            setLoading(false);
            return;
        }
        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            // Redirect is handled by AuthContext state change in App.jsx
        } catch (err) {
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
                    <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">Create Account</h2>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Join to track your career journey
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--border-color)] placeholder-[var(--text-muted)] text-[var(--text-primary)] rounded-t-md focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:z-10 sm:text-sm bg-[var(--bg-main)]"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--border-color)] placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:z-10 sm:text-sm bg-[var(--bg-main)]"
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--border-color)] placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:z-10 sm:text-sm bg-[var(--bg-main)]"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--border-color)] placeholder-[var(--text-muted)] text-[var(--text-primary)] rounded-b-md focus:outline-none focus:ring-[var(--accent)] focus:border-[var(--accent)] focus:z-10 sm:text-sm bg-[var(--bg-main)]"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] hover:opacity-90"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                            {loading ? 'Creating...' : 'Register'}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-[var(--secondary)] hover:text-[var(--accent)]">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
