
try {
    console.log("Requiring aiService...");
    const aiService = require('./services/aiService');
    console.log("aiService loaded:", Object.keys(aiService));

    console.log("Requiring roadmapController...");
    const roadmapController = require('./controllers/roadmapController');
    console.log("roadmapController loaded:", Object.keys(roadmapController));

    console.log("Requiring roadmapRoutes...");
    const roadmapRoutes = require('./routes/roadmapRoutes');
    console.log("roadmapRoutes loaded successfully");

    console.log("Success!");
} catch (error) {
    console.error("Error:", error);
}
