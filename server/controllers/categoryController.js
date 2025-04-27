/**
 * Contrôleur pour les catégories de recettes
 * @module controllers/categoryController
 */

const Category = require('../models/Category');

/**
 * Récupère toutes les catégories
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
};

/**
 * Récupère une catégorie par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie',
      error: error.message
    });
  }
};

/**
 * Crée une nouvelle catégorie
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.createCategory = async (req, res) => {
  try {
    // Vérifier si les champs requis sont présents
    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un nom pour la catégorie'
      });
    }
    
    // Créer la catégorie
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie',
      error: error.message
    });
  }
};

/**
 * Met à jour une catégorie existante
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.update(req.params.id, req.body);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie',
      error: error.message
    });
  }
};

/**
 * Supprime une catégorie
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la catégorie',
      error: error.message
    });
  }
};
