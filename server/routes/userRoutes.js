/**
 * Routes pour les utilisateurs
 * @module routes/userRoutes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes publiques
router.post('/register', userController.register);
router.post('/login', userController.login);

// Routes protégées (nécessitent une authentification)
router.get('/profile', authMiddleware.protect, userController.getProfile);
router.put('/profile', authMiddleware.protect, userController.updateProfile);

// Routes admin (nécessitent une authentification + rôle admin)
router.get('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.getAllUsers);
router.get('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.getUserById);
router.put('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.updateUser);
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.deleteUser);

module.exports = router;
