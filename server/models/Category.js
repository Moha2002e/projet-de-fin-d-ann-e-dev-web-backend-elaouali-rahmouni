/**
 * Modèle de données pour les catégories de recettes
 * @module models/Category
 */

const fs = require('fs');
const path = require('path');

// Chemin vers le fichier JSON qui stockera nos catégories
const categoriesFilePath = path.join(__dirname, '../../data/categories.json');

// Assurons-nous que le dossier data existe
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Assurons-nous que le fichier categories.json existe
if (!fs.existsSync(categoriesFilePath)) {
  // Créer des catégories par défaut
  const defaultCategories = [
    { id: '1', name: 'Entrées', description: 'Recettes d\'entrées', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', name: 'Plats principaux', description: 'Recettes de plats principaux', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '3', name: 'Desserts', description: 'Recettes de desserts', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '4', name: 'Boissons', description: 'Recettes de boissons', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '5', name: 'Végétarien', description: 'Recettes végétariennes', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];
  fs.writeFileSync(categoriesFilePath, JSON.stringify(defaultCategories, null, 2));
}

/**
 * Classe représentant le modèle de catégorie
 */
class Category {
  /**
   * Récupère toutes les catégories
   * @returns {Promise<Array>} Liste des catégories
   */
  static async findAll() {
    try {
      const data = await fs.promises.readFile(categoriesFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors de la lecture des catégories:', error);
      return [];
    }
  }

  /**
   * Récupère une catégorie par son ID
   * @param {string} id - ID de la catégorie
   * @returns {Promise<Object|null>} La catégorie trouvée ou null
   */
  static async findById(id) {
    try {
      const categories = await this.findAll();
      return categories.find(category => category.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la recherche de la catégorie:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle catégorie
   * @param {Object} categoryData - Données de la catégorie
   * @returns {Promise<Object>} La catégorie créée
   */
  static async create(categoryData) {
    try {
      const categories = await this.findAll();
      
      const newCategory = {
        id: Date.now().toString(),
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      categories.push(newCategory);
      await fs.promises.writeFile(categoriesFilePath, JSON.stringify(categories, null, 2));
      return newCategory;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      throw error;
    }
  }

  /**
   * Met à jour une catégorie existante
   * @param {string} id - ID de la catégorie à mettre à jour
   * @param {Object} categoryData - Nouvelles données de la catégorie
   * @returns {Promise<Object|null>} La catégorie mise à jour ou null
   */
  static async update(id, categoryData) {
    try {
      const categories = await this.findAll();
      const index = categories.findIndex(category => category.id === id);
      
      if (index === -1) return null;
      
      const updatedCategory = {
        ...categories[index],
        ...categoryData,
        updatedAt: new Date().toISOString()
      };
      
      categories[index] = updatedCategory;
      await fs.promises.writeFile(categoriesFilePath, JSON.stringify(categories, null, 2));
      return updatedCategory;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      throw error;
    }
  }

  /**
   * Supprime une catégorie
   * @param {string} id - ID de la catégorie à supprimer
   * @returns {Promise<boolean>} True si supprimé, false sinon
   */
  static async delete(id) {
    try {
      const categories = await this.findAll();
      const filteredCategories = categories.filter(category => category.id !== id);
      
      if (filteredCategories.length === categories.length) return false;
      
      await fs.promises.writeFile(categoriesFilePath, JSON.stringify(filteredCategories, null, 2));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      throw error;
    }
  }
}

module.exports = Category;
