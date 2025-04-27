/**
 * Module de gestion des catégories
 * Gère l'affichage et l'interaction avec les catégories de recettes
 */

const Categories = (() => {
  // Éléments DOM
  const categoriesContainer = document.getElementById('categories-container');
  const allCategoriesContainer = document.getElementById('all-categories-container');
  const categoryRecipesContainer = document.getElementById('category-recipes-container');
  const categoryTitle = document.getElementById('category-title');
  
  /**
   * Initialise le module de catégories
   */
  const init = () => {
    // Charger les catégories à l'affichage de la page d'accueil ou de catégories
    document.addEventListener('pageChanged', (e) => {
      const { pageId, data } = e.detail;
      
      if (pageId === 'home-page') {
        loadPopularCategories();
      } else if (pageId === 'categories-page') {
        loadAllCategories();
      } else if (pageId === 'category-recipes-page' && data.categoryId) {
        loadCategoryRecipes(data.categoryId);
      }
    });
    
    // Événement pour les liens de catégories
    document.querySelectorAll('.categories-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        Utils.navigateTo('categories-page');
      });
    });
  };
  
  /**
   * Charge les catégories populaires pour la page d'accueil
   */
  const loadPopularCategories = async () => {
    if (!categoriesContainer) return;
    
    try {
      const response = await API.categories.getAll();
      const categories = response.data;
      
      categoriesContainer.innerHTML = '';
      
      if (categories.length === 0) {
        categoriesContainer.innerHTML = '<p>Aucune catégorie à afficher.</p>';
        return;
      }
      
      // Afficher toutes les catégories ou limiter à 5 si trop nombreuses
      const displayCategories = categories.length > 5 ? categories.slice(0, 5) : categories;
      
      displayCategories.forEach(category => {
        const categoryCard = createCategoryCard(category);
        categoriesContainer.appendChild(categoryCard);
      });
    } catch (error) {
      Utils.handleApiError(error);
      categoriesContainer.innerHTML = '<p>Erreur lors du chargement des catégories.</p>';
    }
  };
  
  /**
   * Charge toutes les catégories pour la page de catégories
   */
  const loadAllCategories = async () => {
    if (!allCategoriesContainer) return;
    
    try {
      const response = await API.categories.getAll();
      const categories = response.data;
      
      allCategoriesContainer.innerHTML = '';
      
      if (categories.length === 0) {
        allCategoriesContainer.innerHTML = '<p>Aucune catégorie à afficher.</p>';
        return;
      }
      
      categories.forEach(category => {
        const categoryCard = createCategoryCard(category);
        allCategoriesContainer.appendChild(categoryCard);
      });
    } catch (error) {
      Utils.handleApiError(error);
      allCategoriesContainer.innerHTML = '<p>Erreur lors du chargement des catégories.</p>';
    }
  };
  
  /**
   * Charge les recettes d'une catégorie
   * @param {string} categoryId - ID de la catégorie
   */
  const loadCategoryRecipes = async (categoryId) => {
    if (!categoryRecipesContainer || !categoryTitle) return;
    
    try {
      // Récupérer les informations de la catégorie
      const categoryResponse = await API.categories.getById(categoryId);
      const category = categoryResponse.data;
      
      // Mettre à jour le titre
      categoryTitle.textContent = `Recettes de ${category.name}`;
      
      // Récupérer les recettes de la catégorie
      const recipesResponse = await API.recipes.getByCategory(categoryId);
      const recipes = recipesResponse.data;
      
      categoryRecipesContainer.innerHTML = '';
      
      if (recipes.length === 0) {
        categoryRecipesContainer.innerHTML = '<p>Aucune recette dans cette catégorie.</p>';
        return;
      }
      
      recipes.forEach(recipe => {
        const recipeCard = createRecipeCardLocal(recipe);
        categoryRecipesContainer.appendChild(recipeCard);
      });
    } catch (error) {
      Utils.handleApiError(error);
      categoryRecipesContainer.innerHTML = '<p>Erreur lors du chargement des recettes.</p>';
    }
  };
  
  /**
   * Crée une carte de catégorie
   * @param {Object} category - Données de la catégorie
   * @returns {HTMLElement} Élément de carte de catégorie
   */
  const createCategoryCard = (category) => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.dataset.id = category.id;
    
    // Déterminer l'icône en fonction du nom de la catégorie
    let icon = 'utensils';
    if (category.name.toLowerCase().includes('entrée')) icon = 'carrot';
    else if (category.name.toLowerCase().includes('plat')) icon = 'hamburger';
    else if (category.name.toLowerCase().includes('dessert')) icon = 'ice-cream';
    else if (category.name.toLowerCase().includes('boisson')) icon = 'glass-martini-alt';
    else if (category.name.toLowerCase().includes('végétarien')) icon = 'leaf';
    
    card.innerHTML = `
      <div class="category-icon">
        <i class="fas fa-${icon}"></i>
      </div>
      <h3 class="category-name">${category.name}</h3>
    `;
    
    // Ajouter l'événement de clic
    card.addEventListener('click', () => {
      Utils.navigateTo('category-recipes-page', { categoryId: category.id });
    });
    
    return card;
  };
  
  /**
   * Crée une carte de recette (implémentation locale)
   * @param {Object} recipe - Données de la recette
   * @returns {HTMLElement} Élément de carte de recette
   */
  const createRecipeCardLocal = (recipe) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const imageUrl = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80';
    
    card.innerHTML = `
      <div class="recipe-image" style="background-image: url('${imageUrl}')"></div>
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.title}</h3>
        <p class="recipe-description">${Utils.truncateText(recipe.description, 100)}</p>
        <div class="recipe-meta">
          <div class="recipe-time">
            <i class="fas fa-clock"></i> ${Utils.formatDuration(recipe.prepTime)}
          </div>
          <div class="recipe-category">
            <i class="fas fa-tag"></i> ${recipe.categoryName || 'Non catégorisé'}
          </div>
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary view-recipe-btn" data-id="${recipe.id}">Voir</button>
          <button class="favorite-btn" data-id="${recipe.id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>
    `;
    
    // Ajouter les événements
    card.querySelector('.view-recipe-btn').addEventListener('click', () => {
      Utils.navigateTo('recipe-detail-page', { recipeId: recipe.id });
    });
    
    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (Recipes && typeof Recipes.toggleFavorite === 'function') {
        Recipes.toggleFavorite(recipe.id, favoriteBtn);
      }
    });
    
    // Vérifier si la recette est déjà en favoris
    const favorites = Utils.getFromLocalStorage('favorites', []);
    if (favorites.includes(recipe.id)) {
      favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
      favoriteBtn.classList.add('active');
    }
    
    return card;
  };
  
  return {
    init,
    loadPopularCategories,
    loadAllCategories,
    loadCategoryRecipes,
    createCategoryCard,
    createRecipeCardLocal
  };
})();
