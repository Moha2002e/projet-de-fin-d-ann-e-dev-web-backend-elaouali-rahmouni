/**
 * Routes pour les recettes
 * @module routes/recipeRoutes
 */

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', recipeController.getAllRecipes);
router.get('/search', recipeController.searchRecipes);
router.get('/category/:categoryId', recipeController.getRecipesByCategory);
router.get('/:id', recipeController.getRecipeById);

// Routes protégées (nécessitent une authentification)
router.post('/', authMiddleware.protect, recipeController.createRecipe);
router.put('/:id', authMiddleware.protect, recipeController.updateRecipe);
router.delete('/:id', authMiddleware.protect, recipeController.deleteRecipe);
router.post('/:id/image', 
  authMiddleware.protect, 
  recipeController.uploadRecipeImage,
  recipeController.addRecipeImage
);

module.exports = router;
