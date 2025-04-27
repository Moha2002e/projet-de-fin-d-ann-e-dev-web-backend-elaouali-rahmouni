/**
 * Contrôleur pour les recettes
 * @module controllers/recipeController
 */

const Recipe = require('../models/Recipe');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/images/recipes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'recipe-' + uniqueSuffix + ext);
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif)'));
  }
};

// Configuration de l'upload
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter
});

/**
 * Récupère toutes les recettes
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des recettes',
      error: error.message
    });
  }
};

/**
 * Récupère une recette par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recette non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la recette',
      error: error.message
    });
  }
};

/**
 * Crée une nouvelle recette
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.createRecipe = async (req, res) => {
  try {
    // Vérifier si les champs requis sont présents
    if (!req.body.title || !req.body.description || !req.body.ingredients || !req.body.instructions) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir tous les champs requis (titre, description, ingrédients, instructions)'
      });
    }
    
    // Créer la recette
    const recipe = await Recipe.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Recette créée avec succès',
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la recette',
      error: error.message
    });
  }
};

/**
 * Met à jour une recette existante
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.update(req.params.id, req.body);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recette non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Recette mise à jour avec succès',
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la recette',
      error: error.message
    });
  }
};

/**
 * Supprime une recette
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.deleteRecipe = async (req, res) => {
  try {
    const deleted = await Recipe.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Recette non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Recette supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la recette',
      error: error.message
    });
  }
};

/**
 * Recherche des recettes
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.searchRecipes = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un terme de recherche'
      });
    }
    
    const recipes = await Recipe.search(query);
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche de recettes',
      error: error.message
    });
  }
};

/**
 * Filtre les recettes par catégorie
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.getRecipesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const recipes = await Recipe.filterByCategory(categoryId);
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du filtrage des recettes par catégorie',
      error: error.message
    });
  }
};

/**
 * Middleware pour l'upload d'image de recette
 */
exports.uploadRecipeImage = upload.single('image');

/**
 * Ajoute une image à une recette
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
exports.addRecipeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir une image'
      });
    }
    
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      // Supprimer l'image si la recette n'existe pas
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'Recette non trouvée'
      });
    }
    
    // Mettre à jour la recette avec le chemin de l'image
    const imagePath = `/images/recipes/${req.file.filename}`;
    const updatedRecipe = await Recipe.update(req.params.id, { image: imagePath });
    
    res.status(200).json({
      success: true,
      message: 'Image ajoutée avec succès',
      data: updatedRecipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'image',
      error: error.message
    });
  }
};
