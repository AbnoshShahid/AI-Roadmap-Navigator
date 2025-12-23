const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

router.post('/update', progressController.updateProgress);
router.get('/:roadmapId', progressController.getProgress);

module.exports = router;
