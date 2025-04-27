/**
 * Routes pour les catégories
 * @module routes/categoryRoutes
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Routes admin (nécessitent une authentification + rôle admin)
router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), categoryController.createCategory);
router.put('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), categoryController.updateCategory);
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;
