const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// GET /api/recommendations
router.get('/', recommendationController.getRecommendations);

// POST /api/recommendations
router.post('/', recommendationController.createRecommendation);

module.exports = router;
