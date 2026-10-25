const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

// GET /api/menu-items/search
router.get('/search', menuItemController.searchDishes);

// GET /api/menu-items/categories
router.get('/categories', menuItemController.getCategories);

// GET /api/menu-items
router.get('/', menuItemController.getMenuItems);

module.exports = router;
