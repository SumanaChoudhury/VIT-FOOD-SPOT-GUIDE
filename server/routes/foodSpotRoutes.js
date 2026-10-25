const express = require('express');
const router = express.Router();
const foodSpotController = require('../controllers/foodSpotController');

// GET /api/food-spots/nearby
router.get('/nearby', foodSpotController.getNearbyFoodSpots);

// GET /api/food-spots
router.get('/', foodSpotController.getFoodSpots);

// GET /api/food-spots/:id
router.get('/:id', foodSpotController.getFoodSpotById);

// GET /api/food-spots/:id/counters
router.get('/:id/counters', foodSpotController.getCountersBySpot);

module.exports = router;
