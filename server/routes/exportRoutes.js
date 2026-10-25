const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// GET /api/export/xml
router.get('/xml', exportController.exportXml);

// GET /api/export/csv
router.get('/csv', exportController.exportCsv);

// GET /api/health
router.get('/health', exportController.getHealth);

module.exports = router;
