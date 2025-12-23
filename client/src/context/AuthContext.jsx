import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { registerUser, loginUser, loadUser } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

// Check token immediately
const token = localStorage.getItem('token');
const initialState = {
    token: token,
    isAuthenticated: !!token, // If token exists, we are tentatively authenticated
    loading: false, // Do not block UI waiting for validation
    user: null
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };
        case 'REGISTER_SUCCESS':
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                ...action.payload,
                isAuthenticated: true,
                loading: false
            };
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
        case 'REGISTER_FAIL':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Verify token in background
    useEffect(() => {
        if (state.token && !state.user) {
            loadUserData();
        }
    }, [state.token]);

    const loadUserData = async () => {
        try {
            const user = await loadUser();
            dispatch({ type: 'USER_LOADED', payload: user });
        } catch (err) {
            // If token is invalid, we eventually logout, but do so carefully
            // The user wanted "If token exists -> allow access". 
            // So arguably we shouldn't block, but if the API returns 401, we must logout.
            // We'll logout only on explicit auth failure.
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    const register = async (formData) => {
        try {
            const data = await registerUser(formData);
            dispatch({ type: 'REGISTER_SUCCESS', payload: data });
            loadUserData();
        } catch (err) {
            const msg = err.response?.data?.msg || 'Registration failed';
            toast.error(msg);
            dispatch({ type: 'REGISTER_FAIL' });
            throw err;
        }
    };

    const login = async (formData) => {
        try {
            const data = await loginUser(formData);

            // CRITICAL: Save token explicitly BEFORE any other requests
            if (data.token) {
                localStorage.setItem('token', data.token);
                console.log('AuthContext: Token saved to localStorage', data.token);
            }

            // Dispatch login success (update state)
            dispatch({ type: 'LOGIN_SUCCESS', payload: data });

            // Load full user data (now safe to call API)
            await loadUserData();

            return data; // Return data so component can redirect
        } catch (err) {
            const msg = err.response?.data?.msg || 'Login failed';
            toast.error(msg);
            dispatch({ type: 'LOGIN_FAIL' });
            throw err;
        }
    };

    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                register,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
