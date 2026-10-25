const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');

// Public submission of menu & price suggestions
router.post('/', suggestionController.submitSuggestion);

// Explicitly protect suggestion feed from public access
router.get('/', (req, res) => {
  res.status(403).json({
    success: false,
    message: 'User suggestions are confidential and accessible to campus administrators only.'
  });
});

module.exports = router;
