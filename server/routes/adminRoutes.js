const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');
const adminController = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Configure multer storage for dataset uploads
const upload = multer({
  dest: path.join(os.tmpdir(), 'vit_food_uploads'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Public admin routes
router.post('/login', authLimiter, adminController.login);
router.post('/logout', adminController.logout);
router.get('/session', adminController.getSession);

// Protected admin routes
router.get('/data-quality', requireAdminAuth, adminController.getDataQualityMetrics);
router.get('/recommendations', requireAdminAuth, adminController.getAllRecommendations);
router.patch('/recommendations/:id', requireAdminAuth, adminController.updateRecommendationStatus);
router.post('/import', requireAdminAuth, upload.single('datasetFile'), adminController.handleDatasetImport);

// Food Spots (Restaurants) CRUD
router.get('/food-spots', requireAdminAuth, adminController.getAdminFoodSpots);
router.post('/food-spots', requireAdminAuth, adminController.addFoodSpot);
router.put('/food-spots/:id', requireAdminAuth, adminController.updateFoodSpot);
router.delete('/food-spots/:id', requireAdminAuth, adminController.deleteFoodSpot);

// Menu Items CRUD
router.get('/menu-items', requireAdminAuth, adminController.getAdminMenuItems);
router.post('/menu-items', requireAdminAuth, adminController.addMenuItem);
router.put('/menu-items/:id', requireAdminAuth, adminController.updateMenuItem);
router.delete('/menu-items/:id', requireAdminAuth, adminController.deleteMenuItem);

// Community Suggestions (Admin-only)
router.get('/suggestions', requireAdminAuth, adminController.getAdminSuggestions);
router.put('/suggestions/:id', requireAdminAuth, adminController.updateAdminSuggestion);
router.delete('/suggestions/:id', requireAdminAuth, adminController.deleteAdminSuggestion);

module.exports = router;
