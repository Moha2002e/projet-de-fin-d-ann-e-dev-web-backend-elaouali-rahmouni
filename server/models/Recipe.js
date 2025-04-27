/**
 * Modèle de données pour les recettes
 * @module models/Recipe
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier JSON qui stockera nos recettes
const recipesFilePath = path.join(__dirname, '../../data/recipes.json');

// Assurons-nous que le dossier data existe
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Assurons-nous que le fichier recipes.json existe
if (!fs.existsSync(recipesFilePath)) {
  fs.writeFileSync(recipesFilePath, JSON.stringify([], null, 2));
}

/**
 * Classe représentant le modèle de recette
 */
class Recipe {
  /**
   * Récupère toutes les recettes
   * @returns {Promise<Array>} Liste des recettes
   */
  static async findAll() {
    try {
      const data = await fs.promises.readFile(recipesFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors de la lecture des recettes:', error);
      return [];
    }
  }

  /**
   * Récupère une recette par son ID
   * @param {string} id - ID de la recette
   * @returns {Promise<Object|null>} La recette trouvée ou null
   */
  static async findById(id) {
    try {
      const recipes = await this.findAll();
      return recipes.find(recipe => recipe.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la recherche de la recette:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle recette
   * @param {Object} recipeData - Données de la recette
   * @returns {Promise<Object>} La recette créée
   */
  static async create(recipeData) {
    try {
      const recipes = await this.findAll();
      const newRecipe = {
        id: Date.now().toString(),
        ...recipeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      recipes.push(newRecipe);
      await fs.promises.writeFile(recipesFilePath, JSON.stringify(recipes, null, 2));
      return newRecipe;
    } catch (error) {
      console.error('Erreur lors de la création de la recette:', error);
      throw error;
    }
  }

  /**
   * Met à jour une recette existante
   * @param {string} id - ID de la recette à mettre à jour
   * @param {Object} recipeData - Nouvelles données de la recette
   * @returns {Promise<Object|null>} La recette mise à jour ou null
   */
  static async update(id, recipeData) {
    try {
      const recipes = await this.findAll();
      const index = recipes.findIndex(recipe => recipe.id === id);
      
      if (index === -1) return null;
      
      const updatedRecipe = {
        ...recipes[index],
        ...recipeData,
        updatedAt: new Date().toISOString()
      };
      
      recipes[index] = updatedRecipe;
      await fs.promises.writeFile(recipesFilePath, JSON.stringify(recipes, null, 2));
      return updatedRecipe;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la recette:', error);
      throw error;
    }
  }

  /**
   * Supprime une recette
   * @param {string} id - ID de la recette à supprimer
   * @returns {Promise<boolean>} True si supprimé, false sinon
   */
  static async delete(id) {
    try {
      const recipes = await this.findAll();
      const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
      
      if (filteredRecipes.length === recipes.length) return false;
      
      await fs.promises.writeFile(recipesFilePath, JSON.stringify(filteredRecipes, null, 2));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la recette:', error);
      throw error;
    }
  }

  /**
   * Recherche des recettes par terme de recherche
   * @param {string} searchTerm - Terme de recherche
   * @returns {Promise<Array>} Liste des recettes correspondantes
   */
  static async search(searchTerm) {
    try {
      const recipes = await this.findAll();
      const term = searchTerm.toLowerCase();
      
      return recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(term) || 
        recipe.description.toLowerCase().includes(term) ||
        recipe.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(term)
        )
      );
    } catch (error) {
      console.error('Erreur lors de la recherche de recettes:', error);
      return [];
    }
  }

  /**
   * Filtre les recettes par catégorie
   * @param {string} categoryId - ID de la catégorie
   * @returns {Promise<Array>} Liste des recettes filtrées
   */
  static async filterByCategory(categoryId) {
    try {
      const recipes = await this.findAll();
      return recipes.filter(recipe => recipe.categoryId === categoryId);
    } catch (error) {
      console.error('Erreur lors du filtrage des recettes par catégorie:', error);
      return [];
    }
  }
}

module.exports = Recipe;
