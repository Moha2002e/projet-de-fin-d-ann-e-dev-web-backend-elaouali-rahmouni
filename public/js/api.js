/**
 * Module de gestion des appels API
 * Centralise toutes les requêtes vers le backend
 */

const API = (() => {
  // URL de base de l'API
  const BASE_URL = '/api';
  
  // Clé API Spoonacular et paramètres
  const SPOONACULAR_API_KEY = 'e16cdcfb5e3c46e3897f91458bb5701d';
  const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';
  const DEFAULT_RECIPES_COUNT = 100;
  
  /**
   * Effectue une requête vers l'API
   * @param {string} endpoint - Point de terminaison de l'API
   * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
   * @param {Object} data - Données à envoyer (pour POST et PUT)
   * @param {boolean} requiresAuth - Si la requête nécessite une authentification
   * @returns {Promise<Object>} - Réponse de l'API
   */
  const apiRequest = async (endpoint, method = 'GET', data = null, requiresAuth = false) => {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Ajouter le token d'authentification si nécessaire
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentification requise');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue');
      }
      
      return result;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };
  
  /**
   * Effectue un upload de fichier vers l'API
   * @param {string} endpoint - Point de terminaison de l'API
   * @param {FormData} formData - Données du formulaire avec le fichier
   * @param {boolean} requiresAuth - Si la requête nécessite une authentification
   * @returns {Promise<Object>} - Réponse de l'API
   */
  const uploadFile = async (endpoint, formData, requiresAuth = true) => {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = {};
    
    // Ajouter le token d'authentification si nécessaire
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentification requise');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method: 'POST',
      headers,
      body: formData
    };
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue lors de l\'upload');
      }
      
      return result;
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    }
  };
  
  /**
   * Effectue une requête vers l'API Spoonacular
   * @param {string} endpoint - Point de terminaison de l'API
   * @param {Object} params - Paramètres de la requête
   * @returns {Promise<Object>} - Réponse de l'API
   */
  const spoonacularRequest = async (endpoint, params = {}) => {
    // Ajouter la clé API aux paramètres
    params.apiKey = SPOONACULAR_API_KEY;
    
    // Construire l'URL avec les paramètres
    const queryParams = new URLSearchParams(params).toString();
    const url = `${SPOONACULAR_BASE_URL}${endpoint}?${queryParams}`;
    
    try {
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue avec l\'API Spoonacular');
      }
      
      return result;
    } catch (error) {
      console.error('Erreur API Spoonacular:', error);
      throw error;
    }
  };
  
  // API Recettes
  const recipes = {
    /**
     * Récupère toutes les recettes
     * @returns {Promise<Array>} Liste des recettes
     */
    getAll: () => apiRequest('/recipes'),
    
    /**
     * Récupère une recette par son ID
     * @param {string} id - ID de la recette
     * @returns {Promise<Object>} La recette
     */
    getById: (id) => apiRequest(`/recipes/${id}`),
    
    /**
     * Crée une nouvelle recette
     * @param {Object} recipeData - Données de la recette
     * @returns {Promise<Object>} La recette créée
     */
    create: (recipeData) => apiRequest('/recipes', 'POST', recipeData, true),
    
    /**
     * Met à jour une recette
     * @param {string} id - ID de la recette
     * @param {Object} recipeData - Nouvelles données de la recette
     * @returns {Promise<Object>} La recette mise à jour
     */
    update: (id, recipeData) => apiRequest(`/recipes/${id}`, 'PUT', recipeData, true),
    
    /**
     * Supprime une recette
     * @param {string} id - ID de la recette
     * @returns {Promise<Object>} Confirmation de suppression
     */
    delete: (id) => apiRequest(`/recipes/${id}`, 'DELETE', null, true),
    
    /**
     * Recherche des recettes
     * @param {string} query - Terme de recherche
     * @returns {Promise<Array>} Liste des recettes correspondantes
     */
    search: (query) => apiRequest(`/recipes/search?query=${encodeURIComponent(query)}`),
    
    /**
     * Récupère les recettes par catégorie
     * @param {string} categoryId - ID de la catégorie
     * @returns {Promise<Array>} Liste des recettes de la catégorie
     */
    getByCategory: (categoryId) => apiRequest(`/recipes/category/${categoryId}`),
    
    /**
     * Ajoute une image à une recette
     * @param {string} id - ID de la recette
     * @param {File} imageFile - Fichier image
     * @returns {Promise<Object>} La recette mise à jour
     */
    addImage: (id, imageFile) => {
      const formData = new FormData();
      formData.append('image', imageFile);
      return uploadFile(`/recipes/${id}/image`, formData);
    },
    
    /**
     * Recherche des recettes via l'API Spoonacular
     * @param {string} query - Terme de recherche
     * @param {number} number - Nombre de résultats à retourner
     * @returns {Promise<Object>} Résultats de la recherche
     */
    searchExternal: (query, number = 12) => {
      return spoonacularRequest('/complexSearch', {
        query,
        number,
        addRecipeInformation: true,
        fillIngredients: true,
        instructionsRequired: true
      });
    },
    
    /**
     * Récupère les détails d'une recette via l'API Spoonacular
     * @param {number} id - ID de la recette Spoonacular
     * @returns {Promise<Object>} Détails de la recette
     */
    getExternalById: (id) => {
      return spoonacularRequest(`/${id}/information`, {
        includeNutrition: false
      });
    },
    
    /**
     * Récupère des recettes aléatoires via l'API Spoonacular
     * @param {number} number - Nombre de recettes à retourner
     * @returns {Promise<Object>} Recettes aléatoires
     */
    getRandomExternal: (number = 8) => {
      return spoonacularRequest('/random', {
        number,
        limitLicense: true,
        tags: 'vegetarian,dessert'
      });
    }
  };
  
  // API Catégories
  const categories = {
    /**
     * Récupère toutes les catégories
     * @returns {Promise<Array>} Liste des catégories
     */
    getAll: () => apiRequest('/categories'),
    
    /**
     * Récupère une catégorie par son ID
     * @param {string} id - ID de la catégorie
     * @returns {Promise<Object>} La catégorie
     */
    getById: (id) => apiRequest(`/categories/${id}`),
    
    /**
     * Crée une nouvelle catégorie (admin)
     * @param {Object} categoryData - Données de la catégorie
     * @returns {Promise<Object>} La catégorie créée
     */
    create: (categoryData) => apiRequest('/categories', 'POST', categoryData, true),
    
    /**
     * Met à jour une catégorie (admin)
     * @param {string} id - ID de la catégorie
     * @param {Object} categoryData - Nouvelles données de la catégorie
     * @returns {Promise<Object>} La catégorie mise à jour
     */
    update: (id, categoryData) => apiRequest(`/categories/${id}`, 'PUT', categoryData, true),
    
    /**
     * Supprime une catégorie (admin)
     * @param {string} id - ID de la catégorie
     * @returns {Promise<Object>} Confirmation de suppression
     */
    delete: (id) => apiRequest(`/categories/${id}`, 'DELETE', null, true)
  };
  
  // API Utilisateurs
  const users = {
    /**
     * Inscrit un nouvel utilisateur
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise<Object>} L'utilisateur créé
     */
    register: (userData) => apiRequest('/users/register', 'POST', userData),
    
    /**
     * Connecte un utilisateur
     * @param {Object} credentials - Identifiants de connexion
     * @returns {Promise<Object>} L'utilisateur connecté avec token
     */
    login: (credentials) => apiRequest('/users/login', 'POST', credentials),
    
    /**
     * Récupère le profil de l'utilisateur connecté
     * @returns {Promise<Object>} Le profil de l'utilisateur
     */
    getProfile: () => apiRequest('/users/profile', 'GET', null, true),
    
    /**
     * Met à jour le profil de l'utilisateur connecté
     * @param {Object} profileData - Nouvelles données du profil
     * @returns {Promise<Object>} Le profil mis à jour
     */
    updateProfile: (profileData) => apiRequest('/users/profile', 'PUT', profileData, true),
    
    /**
     * Récupère tous les utilisateurs (admin)
     * @returns {Promise<Array>} Liste des utilisateurs
     */
    getAll: () => apiRequest('/users', 'GET', null, true),
    
    /**
     * Récupère un utilisateur par son ID (admin)
     * @param {string} id - ID de l'utilisateur
     * @returns {Promise<Object>} L'utilisateur
     */
    getById: (id) => apiRequest(`/users/${id}`, 'GET', null, true),
    
    /**
     * Met à jour un utilisateur (admin)
     * @param {string} id - ID de l'utilisateur
     * @param {Object} userData - Nouvelles données de l'utilisateur
     * @returns {Promise<Object>} L'utilisateur mis à jour
     */
    update: (id, userData) => apiRequest(`/users/${id}`, 'PUT', userData, true),
    
    /**
     * Supprime un utilisateur (admin)
     * @param {string} id - ID de l'utilisateur
     * @returns {Promise<Object>} Confirmation de suppression
     */
    delete: (id) => apiRequest(`/users/${id}`, 'DELETE', null, true)
  };
  
  return {
    recipes,
    categories,
    users
  };
})();
