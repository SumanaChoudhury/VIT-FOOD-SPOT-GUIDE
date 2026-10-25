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

router.post('/food-spots', requireAdminAuth, adminController.addFoodSpot);
router.put('/food-spots/:id', requireAdminAuth, adminController.updateFoodSpot);
router.delete('/food-spots/:id', requireAdminAuth, adminController.deleteFoodSpot);

module.exports = router;
