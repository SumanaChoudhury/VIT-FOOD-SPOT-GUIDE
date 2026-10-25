const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// GET /api/locations
router.get('/', locationController.getLocations);

// GET /api/locations/:slug
router.get('/:slug', locationController.getLocationBySlug);

module.exports = router;
