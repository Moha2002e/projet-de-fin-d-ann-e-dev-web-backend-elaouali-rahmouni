/**
 * Contrôleur pour les utilisateurs
 * @module controllers/userController
 */

const User = require('../models/User');

/**
 * Enregistre un nouvel utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Vérifier si tous les champs sont remplis
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir tous les champs requis (nom, email, mot de passe)'
      });
    }
    
    // Créer l'utilisateur
    const user = await User.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * Connecte un utilisateur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si tous les champs sont remplis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir votre email et votre mot de passe'
      });
    }
    
    // Authentifier l'utilisateur
    const user = await User.authenticate(email, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

/**
 * Récupère le profil de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateProfile = async (req, res) => {
  try {
    // Empêcher la mise à jour du rôle par l'utilisateur
    if (req.body.role && req.user.role !== 'admin') {
      delete req.body.role;
    }
    
    const user = await User.update(req.user.id, req.body);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

/**
 * Récupère tous les utilisateurs (admin seulement)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    // Filtrer les mots de passe
    const filteredUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.status(200).json({
      success: true,
      count: filteredUsers.length,
      data: filteredUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

/**
 * Récupère un utilisateur par son ID (admin seulement)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Filtrer le mot de passe
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * Met à jour un utilisateur (admin seulement)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateUser = async (req, res) => {
  try {
    const user = await User.update(req.params.id, req.body);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * Supprime un utilisateur (admin seulement)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};
