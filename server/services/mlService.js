const axios = require('axios');

const ML_SERVICE_URL = 'http://localhost:8000';

exports.getPredictions = async ({ education, skills, interests }) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/predict-career`, {
            education,
            skills,
            interests
        }, {
            timeout: 3000 // Fail fast if ML service is down
        });

        return response.data; // Return full response including meta
    } catch (error) {
        console.warn('ML Service unavailable or failed:', error.message);
        return { recommendedCareers: [] }; // Graceful fallback
    }
};
