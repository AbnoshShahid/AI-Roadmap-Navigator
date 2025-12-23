const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');

const auth = require('../middleware/auth');

router.post('/generate', roadmapController.createRoadmap); // Public generation (AI)
router.post('/', auth, roadmapController.saveRoadmap); // Private save (POST /api/roadmaps)
router.get('/', auth, roadmapController.getAllRoadmaps); // GET /api/roadmaps (Dashboard)
router.get('/history', auth, roadmapController.getRoadmapHistory);
router.get('/all', auth, roadmapController.getAllRoadmaps); // Legacy/Dashboard duplication
router.get('/:id', auth, roadmapController.getRoadmapById);
router.post('/:id/initialize-progress', auth, roadmapController.initializeRoadmapProgress);
router.patch('/:id/progress', auth, roadmapController.updateRoadmapProgress);

module.exports = router;
