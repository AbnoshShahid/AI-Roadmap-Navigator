import axios from 'axios';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL;

    if (!url) {
        // Default to localhost in dev, production URL in prod
        url = import.meta.env.DEV
            ? 'http://localhost:5000'
            : 'https://ai-roadmap-navigator-production.up.railway.app';
    }

    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

// Add a request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
            // Also add Bearer token as requested by user verification steps
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log(`[API] Attaching token to request: ${config.url}`);
        } else {
            console.warn(`[API] No token found for request: ${config.url}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth Service Methods
export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (userData) => {
    // 5-second hard timeout for login
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login Request Timed Out')), 5000)
    );

    console.log(`[API] sending login request to: ${api.defaults.baseURL}/auth/login`, userData);
    const loginRequest = api.post('/auth/login', userData);

    const response = await Promise.race([loginRequest, timeout]);
    return response.data;
};

export const loadUser = async () => {
    const response = await api.get('/auth/user');
    return response.data;
};

export const generateRoadmap = async (data) => {
    const response = await api.post('/roadmaps/generate', data);
    return response.data;
};

export const saveRoadmap = async (data) => {
    const response = await api.post('/roadmaps', data);
    return response.data;
};

export const getHistory = async () => {
    const response = await api.get('/roadmap/history');
    return response.data;
};

export const updateProgress = async (data) => {
    const response = await api.post('/progress/update', data);
    return response.data;
};

export const getProgress = async (roadmapId) => {
    const response = await api.get(`/progress/${roadmapId}`);
    return response.data;
};

export const getAllRoadmaps = async () => {
    // Force fresh fetch with timestamp to prevent browser caching of progress stats
    const response = await api.get(`/roadmaps?t=${Date.now()}`);
    return response.data;
};

export const getRoadmapById = async (id) => {
    const response = await api.get(`/roadmaps/${id}`);
    return response.data;
};

export const updateRoadmapProgress = async (id, data) => {
    const response = await api.patch(`/roadmaps/${id}/progress`, data);
    return response.data;
};

export const initializeRoadmapProgress = async (id) => {
    const response = await api.post(`/roadmaps/${id}/initialize-progress`);
    return response.data;
};
