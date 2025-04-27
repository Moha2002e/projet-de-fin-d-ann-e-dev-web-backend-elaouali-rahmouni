/**
 * Module de gestion des recettes
 * Gère l'affichage, la création, la modification et la suppression des recettes
 */

const Recipes = (() => {
  // Éléments DOM
  const featuredRecipesContainer = document.getElementById('featured-recipes-container');
  const latestRecipesContainer = document.getElementById('latest-recipes-container');
  const recipeDetailContainer = document.getElementById('recipe-detail-container');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const searchResultsContainer = document.getElementById('search-results-container');
  const searchQuery = document.getElementById('search-query');
  const recipeForm = document.getElementById('recipe-form');
  const addIngredientBtn = document.getElementById('add-ingredient-btn');
  const addInstructionBtn = document.getElementById('add-instruction-btn');
  const ingredientsContainer = document.getElementById('ingredients-container');
  const instructionsContainer = document.getElementById('instructions-container');
  const recipeFormTitle = document.getElementById('recipe-form-title');
  const cancelRecipeBtn = document.getElementById('cancel-recipe-btn');
  const exploreButton = document.getElementById('explore-button');
  const addRecipeButton = document.getElementById('add-recipe-button');
  const createRecipeButton = document.getElementById('create-recipe-button');
  
  // Variables d'état
  let allRecipes = [];
  let currentRecipe = null;
  
  /**
   * Initialise le module de recettes
   */
  const init = () => {
    // Charger les recettes à l'affichage de la page d'accueil
    document.addEventListener('pageChanged', (e) => {
      const { pageId, data } = e.detail;
      
      if (pageId === 'home-page') {
        loadFeaturedRecipes();
        loadLatestRecipes();
      } else if (pageId === 'recipe-detail-page' && data.recipeId) {
        loadRecipeDetails(data.recipeId);
      } else if (pageId === 'search-results-page' && data.query) {
        searchRecipes(data.query);
      } else if (pageId === 'recipe-form-page') {
        initRecipeForm(data);
      }
    });
    
    // Événements de recherche
    if (searchInput && searchButton) {
      searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
          Utils.navigateTo('search-results-page', { query });
        }
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            Utils.navigateTo('search-results-page', { query });
          }
        }
      });
    }
    
    // Événements du formulaire de recette
    if (recipeForm) {
      recipeForm.addEventListener('submit', handleRecipeSubmit);
    }
    
    if (addIngredientBtn) {
      addIngredientBtn.addEventListener('click', addIngredientRow);
    }
    
    if (addInstructionBtn) {
      addInstructionBtn.addEventListener('click', addInstructionRow);
    }
    
    if (cancelRecipeBtn) {
      cancelRecipeBtn.addEventListener('click', () => {
        Utils.navigateTo('profile-page');
      });
    }
    
    // Événements des boutons
    if (exploreButton) {
      exploreButton.addEventListener('click', () => {
        Utils.navigateTo('categories-page');
      });
    }
    
    if (addRecipeButton) {
      addRecipeButton.addEventListener('click', () => {
        Utils.navigateTo('recipe-form-page', { mode: 'create' });
      });
    }
    
    if (createRecipeButton) {
      createRecipeButton.addEventListener('click', () => {
        Utils.navigateTo('recipe-form-page', { mode: 'create' });
      });
    }
    
    // Initialiser les gestionnaires d'événements pour les boutons dynamiques
    initDynamicEventHandlers();
  };
  
  /**
   * Initialise les gestionnaires d'événements pour les éléments créés dynamiquement
   */
  const initDynamicEventHandlers = () => {
    // Délégation d'événements pour les boutons de suppression d'ingrédients
    if (ingredientsContainer) {
      ingredientsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-ingredient-btn')) {
          e.target.closest('.ingredient-row').remove();
        }
      });
    }
    
    // Délégation d'événements pour les boutons de suppression d'instructions
    if (instructionsContainer) {
      instructionsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.remove-instruction-btn')) {
          e.target.closest('.instruction-row').remove();
        }
      });
    }
  };
  
  /**
   * Charge les recettes à la une
   */
  const loadFeaturedRecipes = async () => {
    if (!featuredRecipesContainer) return;
    
    try {
      featuredRecipesContainer.innerHTML = '<div class="loading">Chargement des recettes...</div>';
      
      // Utiliser des recettes prédéfinies pour garantir l'affichage
      const predefinedRecipes = [
        {
          id: 'preset-1',
          title: 'Pizza Margherita',
          description: 'Une délicieuse pizza classique avec tomates, mozzarella et basilic.',
          image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
          prepTime: 20,
          cookTime: 15,
          servings: 4,
          categoryName: 'Plat principal'
        },
        {
          id: 'preset-2',
          title: 'Pâtes Carbonara',
          description: 'Un plat de pâtes crémeux avec du lard, des œufs et du parmesan.',
          image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
          prepTime: 10,
          cookTime: 15,
          servings: 4,
          categoryName: 'Plat principal'
        },
        {
          id: 'preset-3',
          title: 'Salade César',
          description: 'Une salade fraîche avec du poulet grillé, des croûtons et une sauce crémeuse.',
          image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
          prepTime: 15,
          cookTime: 10,
          servings: 2,
          categoryName: 'Entrées'
        },
        {
          id: 'preset-4',
          title: 'Tiramisu',
          description: 'Un dessert italien classique à base de café, de mascarpone et de biscuits.',
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
          prepTime: 30,
          cookTime: 0,
          servings: 6,
          categoryName: 'Desserts'
        }
      ];
      
      featuredRecipesContainer.innerHTML = '';
      
      // Afficher les recettes prédéfinies
      predefinedRecipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        featuredRecipesContainer.appendChild(recipeCard);
      });
      
      // Essayer d'obtenir des recettes de l'API en arrière-plan pour les prochaines visites
      try {
        const response = await API.recipes.getRandomExternal(4);
        console.log('Recettes aléatoires chargées pour la prochaine visite:', response);
      } catch (error) {
        console.error('Impossible de charger les recettes aléatoires:', error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error);
      featuredRecipesContainer.innerHTML = '<p>Erreur lors du chargement des recettes.</p>';
    }
  };
  
  /**
   * Charge les dernières recettes
   */
  const loadLatestRecipes = async () => {
    if (!latestRecipesContainer) return;
    
    try {
      latestRecipesContainer.innerHTML = '<div class="loading">Chargement des recettes...</div>';
      
      // Charger les recettes personnelles depuis l'API
      const response = await API.recipes.getAll();
      
      if (response && response.data && response.data.length > 0) {
        // Si nous avons des recettes personnelles, les afficher
        latestRecipesContainer.innerHTML = '';
        response.data.forEach(recipe => {
          const recipeCard = createRecipeCard(recipe);
          latestRecipesContainer.appendChild(recipeCard);
        });
      } else {
        // Si aucune recette personnelle n'est trouvée, afficher un message
        latestRecipesContainer.innerHTML = `
          <div class="no-recipes">
            <p>Vous n'avez pas encore créé de recettes personnelles.</p>
            <button id="create-recipe-button" class="btn btn-primary">Créer une recette</button>
          </div>
        `;
        
        // Ajouter l'événement au bouton
        const createRecipeButton = document.getElementById('create-recipe-button');
        if (createRecipeButton) {
          createRecipeButton.addEventListener('click', () => {
            Utils.navigateTo('recipe-form-page', { mode: 'create' });
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dernières recettes:', error);
      latestRecipesContainer.innerHTML = `
        <div class="error">
          <p>Une erreur est survenue lors du chargement des recettes.</p>
          <button class="btn btn-secondary retry-btn">Réessayer</button>
        </div>
      `;
      
      const retryBtn = latestRecipesContainer.querySelector('.retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadLatestRecipes);
      }
    }
  };
  
  /**
   * Convertit une recette externe au format de notre application
   * @param {Object} externalRecipe - Recette de l'API externe
   * @returns {Object} Recette au format de notre application
   */
  const convertExternalRecipe = (externalRecipe) => {
    // Extraire les ingrédients
    const ingredients = externalRecipe.extendedIngredients 
      ? externalRecipe.extendedIngredients.map(ingredient => ({
          name: ingredient.name,
          quantity: ingredient.amount,
          unit: ingredient.unit
        }))
      : [];
    
    // Extraire les instructions
    let instructions = [];
    if (externalRecipe.analyzedInstructions && externalRecipe.analyzedInstructions.length > 0) {
      instructions = externalRecipe.analyzedInstructions[0].steps.map(step => step.step);
    }
    
    // Créer la recette au format de notre application
    return {
      id: `ext-${externalRecipe.id}`,
      title: externalRecipe.title,
      description: externalRecipe.summary ? stripHtml(externalRecipe.summary) : '',
      image: externalRecipe.image,
      prepTime: externalRecipe.preparationMinutes || externalRecipe.readyInMinutes || 30,
      cookTime: externalRecipe.cookingMinutes || 20,
      servings: externalRecipe.servings || 4,
      ingredients: ingredients,
      instructions: instructions,
      categoryId: '1', // Catégorie par défaut
      categoryName: externalRecipe.dishTypes && externalRecipe.dishTypes.length > 0 ? externalRecipe.dishTypes[0] : 'Plat principal',
      createdAt: new Date().toISOString(),
      isExternal: true,
      sourceUrl: externalRecipe.sourceUrl
    };
  };
  
  /**
   * Supprime les balises HTML d'une chaîne de caractères
   * @param {string} html - Chaîne contenant du HTML
   * @returns {string} Chaîne sans HTML
   */
  const stripHtml = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };
  
  /**
   * Charge les détails d'une recette
   * @param {string} recipeId - ID de la recette
   */
  const loadRecipeDetails = async (recipeId) => {
    if (!recipeDetailContainer) return;
    
    console.log('Chargement des détails de la recette:', recipeId);
    recipeDetailContainer.innerHTML = '<div class="loading">Chargement de la recette...</div>';
    
    try {
      let recipe;
      
      // Vérifier si c'est une recette prédéfinie
      if (recipeId.startsWith('preset-')) {
        console.log('Recette prédéfinie détectée:', recipeId);
        // Recettes prédéfinies (même liste que dans loadFeaturedRecipes)
        const predefinedRecipes = [
          {
            id: 'preset-1',
            title: 'Pizza Margherita',
            description: 'Une délicieuse pizza classique avec tomates, mozzarella et basilic.',
            image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
            prepTime: 20,
            cookTime: 15,
            servings: 4,
            categoryName: 'Plat principal',
            ingredients: [
              { name: 'Pâte à pizza', quantity: '1', unit: '' },
              { name: 'Sauce tomate', quantity: '100', unit: 'g' },
              { name: 'Mozzarella', quantity: '125', unit: 'g' },
              { name: 'Basilic frais', quantity: 'quelques', unit: 'feuilles' },
              { name: 'Huile d\'olive', quantity: '1', unit: 'cuillère à soupe' }
            ],
            instructions: [
              'Préchauffer le four à 220°C.',
              'Étaler la pâte à pizza sur une plaque de cuisson.',
              'Répartir la sauce tomate sur la pâte.',
              'Ajouter la mozzarella coupée en tranches.',
              'Enfourner pendant 12-15 minutes jusqu\'à ce que la pâte soit dorée.',
              'Ajouter les feuilles de basilic frais et un filet d\'huile d\'olive avant de servir.'
            ]
          },
          {
            id: 'preset-2',
            title: 'Pâtes Carbonara',
            description: 'Un plat de pâtes crémeux avec du lard, des œufs et du parmesan.',
            image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
            prepTime: 10,
            cookTime: 15,
            servings: 4,
            categoryName: 'Plat principal',
            ingredients: [
              { name: 'Spaghetti', quantity: '400', unit: 'g' },
              { name: 'Lardons', quantity: '150', unit: 'g' },
              { name: 'Œufs', quantity: '3', unit: '' },
              { name: 'Parmesan râpé', quantity: '50', unit: 'g' },
              { name: 'Poivre noir', quantity: 'au goût', unit: '' }
            ],
            instructions: [
              'Faire cuire les pâtes dans une grande casserole d\'eau salée.',
              'Pendant ce temps, faire revenir les lardons dans une poêle sans ajouter de matière grasse.',
              'Dans un bol, battre les œufs avec le parmesan râpé et du poivre.',
              'Égoutter les pâtes et les ajouter dans la poêle avec les lardons, hors du feu.',
              'Verser le mélange œufs-parmesan et remuer rapidement pour créer une sauce crémeuse.',
              'Servir immédiatement avec un peu de parmesan supplémentaire.'
            ]
          },
          {
            id: 'preset-3',
            title: 'Salade César',
            description: 'Une salade fraîche avec du poulet grillé, des croûtons et une sauce crémeuse.',
            image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
            prepTime: 15,
            cookTime: 10,
            servings: 2,
            categoryName: 'Entrées',
            ingredients: [
              { name: 'Laitue romaine', quantity: '1', unit: 'tête' },
              { name: 'Blanc de poulet', quantity: '1', unit: '' },
              { name: 'Croûtons', quantity: '50', unit: 'g' },
              { name: 'Parmesan', quantity: '30', unit: 'g' },
              { name: 'Sauce César', quantity: '4', unit: 'cuillères à soupe' }
            ],
            instructions: [
              'Laver et essorer la laitue romaine, puis la couper en morceaux.',
              'Faire griller le blanc de poulet et le couper en tranches.',
              'Dans un grand saladier, mélanger la laitue, le poulet et les croûtons.',
              'Ajouter la sauce César et mélanger délicatement.',
              'Saupoudrer de parmesan râpé avant de servir.'
            ]
          },
          {
            id: 'preset-4',
            title: 'Tiramisu',
            description: 'Un dessert italien classique à base de café, de mascarpone et de biscuits.',
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
            prepTime: 30,
            cookTime: 0,
            servings: 6,
            categoryName: 'Desserts',
            ingredients: [
              { name: 'Mascarpone', quantity: '250', unit: 'g' },
              { name: 'Œufs', quantity: '3', unit: '' },
              { name: 'Sucre', quantity: '100', unit: 'g' },
              { name: 'Café fort', quantity: '200', unit: 'ml' },
              { name: 'Biscuits à la cuillère', quantity: '24', unit: '' },
              { name: 'Cacao en poudre', quantity: '2', unit: 'cuillères à soupe' }
            ],
            instructions: [
              'Séparer les blancs des jaunes d\'œufs.',
              'Battre les jaunes avec le sucre jusqu\'à ce que le mélange blanchisse.',
              'Ajouter le mascarpone et mélanger jusqu\'à obtenir une crème lisse.',
              'Monter les blancs en neige et les incorporer délicatement à la crème.',
              'Tremper rapidement les biscuits dans le café et les disposer dans un plat.',
              'Recouvrir d\'une couche de crème, puis répéter l\'opération.',
              'Saupoudrer de cacao et réfrigérer pendant au moins 4 heures avant de servir.'
            ]
          }
        ];
        
        // Trouver la recette prédéfinie correspondante
        recipe = predefinedRecipes.find(r => r.id === recipeId);
        console.log('Recette prédéfinie trouvée:', recipe);
        
        if (!recipe) {
          throw new Error('Recette prédéfinie non trouvée');
        }
      }
      // Vérifier si c'est une recette externe
      else if (recipeId.startsWith('ext-')) {
        console.log('Recette externe détectée:', recipeId);
        const externalId = recipeId.replace('ext-', '');
        const response = await API.recipes.getExternalById(externalId);
        recipe = convertExternalRecipe(response);
      } else {
        console.log('Recette locale détectée:', recipeId);
        const response = await API.recipes.getById(recipeId);
        recipe = response.data;
      }
      
      currentRecipe = recipe;
      console.log('Recette chargée:', currentRecipe);
      
      // Récupérer la catégorie
      let categoryName = recipe.categoryName || 'Non catégorisé';
      if (recipe.categoryId && !recipe.isExternal) {
        try {
          const categoryResponse = await API.categories.getById(recipe.categoryId);
          categoryName = categoryResponse.data.name;
        } catch (error) {
          console.error('Erreur lors de la récupération de la catégorie:', error);
        }
      }
      
      // Créer l'affichage détaillé
      recipeDetailContainer.innerHTML = '';
      
      const detailElement = document.createElement('div');
      detailElement.className = 'recipe-detail';
      
      const imageUrl = recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80';
      
      detailElement.innerHTML = `
        <div class="recipe-detail-image" style="background-image: url('${imageUrl}')"></div>
        <div class="recipe-detail-content">
          <div class="recipe-detail-header">
            <h1 class="recipe-detail-title">${recipe.title}</h1>
            <div class="recipe-detail-meta">
              <div class="recipe-prep-time">
                <i class="fas fa-clock"></i> Préparation: ${Utils.formatDuration(recipe.prepTime)}
              </div>
              <div class="recipe-cook-time">
                <i class="fas fa-fire"></i> Cuisson: ${Utils.formatDuration(recipe.cookTime || 0)}
              </div>
              <div class="recipe-servings">
                <i class="fas fa-utensils"></i> ${recipe.servings} portions
              </div>
              <div class="recipe-category">
                <i class="fas fa-tag"></i> ${categoryName}
              </div>
              ${recipe.sourceUrl ? `
              <div class="recipe-source">
                <i class="fas fa-external-link-alt"></i> <a href="${recipe.sourceUrl}" target="_blank">Source originale</a>
              </div>
              ` : ''}
              ${!recipe.isExternal ? `
              <div class="recipe-date">
                <i class="fas fa-calendar-alt"></i> ${Utils.formatDate(recipe.createdAt)}
              </div>
              ` : ''}
            </div>
            <div class="recipe-actions">
              <button class="favorite-btn" id="favorite-recipe-btn">
                <i class="far fa-heart"></i>
              </button>
              ${!recipe.isExternal && Utils.isLoggedIn() && recipe.userId === Utils.getCurrentUser().id ? `
                <button class="btn btn-secondary edit-recipe-btn" data-id="${recipe.id}">Modifier</button>
                <button class="btn btn-secondary delete-recipe-btn" data-id="${recipe.id}">Supprimer</button>
              ` : ''}
            </div>
          </div>
          
          <div class="recipe-detail-description">
            ${recipe.description}
          </div>
          
          <div class="recipe-detail-section">
            <h3>Ingrédients</h3>
            <ul class="ingredients-list">
              ${recipe.ingredients.map(ingredient => `
                <li class="ingredient-item">
                  <i class="fas fa-check"></i>
                  ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}
                </li>
              `).join('')}
            </ul>
          </div>
          
          <div class="recipe-detail-section">
            <h3>Instructions</h3>
            <ol class="instructions-list">
              ${recipe.instructions.map(instruction => `
                <li class="instruction-item">${instruction}</li>
              `).join('')}
            </ol>
          </div>
        </div>
      `;
      
      recipeDetailContainer.appendChild(detailElement);
      
      // Ajouter les événements
      const favoriteBtn = document.getElementById('favorite-recipe-btn');
      if (favoriteBtn) {
        favoriteBtn.addEventListener('click', () => {
          toggleFavorite(currentRecipe.id, favoriteBtn);
        });
        
        // Vérifier si la recette est déjà en favoris
        const favorites = Utils.getFromLocalStorage('favorites', []);
        if (favorites.includes(recipe.id)) {
          favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
          favoriteBtn.classList.add('active');
        }
      }
      
      const editBtn = recipeDetailContainer.querySelector('.edit-recipe-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          Utils.navigateTo('recipe-form-page', { recipeId: recipe.id, mode: 'edit' });
        });
      }
      
      const deleteBtn = recipeDetailContainer.querySelector('.delete-recipe-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          confirmDeleteRecipe(recipe);
        });
      }
    } catch (error) {
      console.error('Erreur détaillée lors du chargement de la recette:', error);
      recipeDetailContainer.innerHTML = '<p>Erreur lors du chargement de la recette.</p>';
    }
  };
  
  /**
   * Recherche des recettes
   * @param {string} query - Terme de recherche
   */
  const searchRecipes = async (query) => {
    if (!searchResultsContainer || !searchQuery) return;
    
    searchQuery.textContent = `Résultats pour "${query}"`;
    searchResultsContainer.innerHTML = '<div class="loading">Recherche en cours...</div>';
    
    try {
      console.log('Recherche de recettes pour:', query);
      
      // Essayer directement avec l'API Spoonacular
      try {
        const response = await API.recipes.searchExternal(query, 12);
        console.log('Réponse API Spoonacular:', response);
        
        const recipes = response.results || [];
        
        searchResultsContainer.innerHTML = '';
        
        if (recipes.length === 0) {
          // Si aucun résultat, utiliser les recettes prédéfinies
          const predefinedRecipes = [
            {
              id: 'preset-1',
              title: 'Pizza Margherita',
              description: 'Une délicieuse pizza classique avec tomates, mozzarella et basilic.',
              image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
              prepTime: 20,
              cookTime: 15,
              servings: 4,
              ingredients: [
                { name: 'pâte à pizza', quantity: '1', unit: '' },
                { name: 'sauce tomate', quantity: '200', unit: 'g' },
                { name: 'mozzarella', quantity: '250', unit: 'g' },
                { name: 'basilic frais', quantity: '10', unit: 'feuilles' },
                { name: 'huile d\'olive', quantity: '2', unit: 'cuillères à soupe' }
              ],
              instructions: [
                'Préchauffer le four à 220°C.',
                'Étaler la pâte à pizza sur une plaque de cuisson.',
                'Répartir la sauce tomate sur la pâte.',
                'Ajouter la mozzarella coupée en tranches.',
                'Enfourner pendant 12-15 minutes jusqu\'à ce que la pâte soit dorée.',
                'Ajouter les feuilles de basilic frais et un filet d\'huile d\'olive avant de servir.'
              ],
              categoryName: 'Plat principal',
              createdAt: new Date().toISOString()
            },
            {
              id: 'preset-2',
              title: 'Pizza Pepperoni',
              description: 'Une pizza savoureuse garnie de pepperoni épicé et de fromage fondant.',
              image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
              prepTime: 15,
              cookTime: 20,
              servings: 4,
              ingredients: [
                { name: 'pâte à pizza', quantity: '1', unit: '' },
                { name: 'sauce tomate', quantity: '200', unit: 'g' },
                { name: 'mozzarella râpée', quantity: '300', unit: 'g' },
                { name: 'pepperoni', quantity: '100', unit: 'g' },
                { name: 'origan', quantity: '1', unit: 'cuillère à café' }
              ],
              instructions: [
                'Préchauffer le four à 220°C.',
                'Étaler la pâte à pizza sur une plaque de cuisson.',
                'Répartir la sauce tomate sur la pâte.',
                'Saupoudrer de mozzarella râpée.',
                'Disposer les tranches de pepperoni sur le dessus.',
                'Saupoudrer d\'origan.',
                'Enfourner pendant 15-20 minutes jusqu\'à ce que le fromage soit bien fondu et doré.'
              ],
              categoryName: 'Plat principal',
              createdAt: new Date().toISOString()
            },
            {
              id: 'preset-3',
              title: 'Pizza Quatre Fromages',
              description: 'Une pizza gourmande avec un mélange de quatre fromages différents.',
              image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
              prepTime: 20,
              cookTime: 15,
              servings: 4,
              ingredients: [
                { name: 'pâte à pizza', quantity: '1', unit: '' },
                { name: 'sauce tomate', quantity: '150', unit: 'g' },
                { name: 'mozzarella', quantity: '100', unit: 'g' },
                { name: 'gorgonzola', quantity: '75', unit: 'g' },
                { name: 'parmesan râpé', quantity: '50', unit: 'g' },
                { name: 'chèvre', quantity: '75', unit: 'g' },
                { name: 'origan', quantity: '1', unit: 'cuillère à café' }
              ],
              instructions: [
                'Préchauffer le four à 220°C.',
                'Étaler la pâte à pizza sur une plaque de cuisson.',
                'Répartir la sauce tomate sur la pâte.',
                'Répartir les différents fromages sur la pizza.',
                'Saupoudrer d\'origan.',
                'Enfourner pendant 12-15 minutes jusqu\'à ce que les fromages soient fondus et légèrement dorés.'
              ],
              categoryName: 'Plat principal',
              createdAt: new Date().toISOString()
            }
          ];
          
          // Filtrer les recettes prédéfinies en fonction de la recherche
          const filteredRecipes = predefinedRecipes.filter(recipe => 
            recipe.title.toLowerCase().includes(query.toLowerCase()) ||
            recipe.description.toLowerCase().includes(query.toLowerCase()) ||
            recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query.toLowerCase()))
          );
          
          if (filteredRecipes.length > 0) {
            filteredRecipes.forEach(recipe => {
              const recipeCard = createRecipeCard(recipe);
              searchResultsContainer.appendChild(recipeCard);
            });
          } else {
            searchResultsContainer.innerHTML = '<p>Aucune recette trouvée pour cette recherche.</p>';
          }
          return;
        }
        
        // Convertir les recettes externes au format de notre application
        recipes.forEach(recipe => {
          const recipeData = convertExternalRecipe(recipe);
          const recipeCard = createRecipeCard(recipeData);
          searchResultsContainer.appendChild(recipeCard);
        });
      } catch (error) {
        console.error('Erreur API Spoonacular:', error);
        
        // En cas d'erreur, utiliser les recettes prédéfinies
        const predefinedRecipes = [
          {
            id: 'preset-1',
            title: 'Pizza Margherita',
            description: 'Une délicieuse pizza classique avec tomates, mozzarella et basilic.',
            image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
            prepTime: 20,
            cookTime: 15,
            servings: 4,
            ingredients: [
              { name: 'pâte à pizza', quantity: '1', unit: '' },
              { name: 'sauce tomate', quantity: '200', unit: 'g' },
              { name: 'mozzarella', quantity: '250', unit: 'g' },
              { name: 'basilic frais', quantity: '10', unit: 'feuilles' },
              { name: 'huile d\'olive', quantity: '2', unit: 'cuillères à soupe' }
            ],
            instructions: [
              'Préchauffer le four à 220°C.',
              'Étaler la pâte à pizza sur une plaque de cuisson.',
              'Répartir la sauce tomate sur la pâte.',
              'Ajouter la mozzarella coupée en tranches.',
              'Enfourner pendant 12-15 minutes jusqu\'à ce que la pâte soit dorée.',
              'Ajouter les feuilles de basilic frais et un filet d\'huile d\'olive avant de servir.'
            ],
            categoryName: 'Plat principal',
            createdAt: new Date().toISOString()
          },
          {
            id: 'preset-2',
            title: 'Pizza Pepperoni',
            description: 'Une pizza savoureuse garnie de pepperoni épicé et de fromage fondant.',
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
            prepTime: 15,
            cookTime: 20,
            servings: 4,
            ingredients: [
              { name: 'pâte à pizza', quantity: '1', unit: '' },
              { name: 'sauce tomate', quantity: '200', unit: 'g' },
              { name: 'mozzarella râpée', quantity: '300', unit: 'g' },
              { name: 'pepperoni', quantity: '100', unit: 'g' },
              { name: 'origan', quantity: '1', unit: 'cuillère à café' }
            ],
            instructions: [
              'Préchauffer le four à 220°C.',
              'Étaler la pâte à pizza sur une plaque de cuisson.',
              'Répartir la sauce tomate sur la pâte.',
              'Saupoudrer de mozzarella râpée.',
              'Disposer les tranches de pepperoni sur le dessus.',
              'Saupoudrer d\'origan.',
              'Enfourner pendant 15-20 minutes jusqu\'à ce que le fromage soit bien fondu et doré.'
            ],
            categoryName: 'Plat principal',
            createdAt: new Date().toISOString()
          },
          {
            id: 'preset-3',
            title: 'Pizza Quatre Fromages',
            description: 'Une pizza gourmande avec un mélange de quatre fromages différents.',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80',
            prepTime: 20,
            cookTime: 15,
            servings: 4,
            ingredients: [
              { name: 'pâte à pizza', quantity: '1', unit: '' },
              { name: 'sauce tomate', quantity: '150', unit: 'g' },
              { name: 'mozzarella', quantity: '100', unit: 'g' },
              { name: 'gorgonzola', quantity: '75', unit: 'g' },
              { name: 'parmesan râpé', quantity: '50', unit: 'g' },
              { name: 'chèvre', quantity: '75', unit: 'g' },
              { name: 'origan', quantity: '1', unit: 'cuillère à café' }
            ],
            instructions: [
              'Préchauffer le four à 220°C.',
              'Étaler la pâte à pizza sur une plaque de cuisson.',
              'Répartir la sauce tomate sur la pâte.',
              'Répartir les différents fromages sur la pizza.',
              'Saupoudrer d\'origan.',
              'Enfourner pendant 12-15 minutes jusqu\'à ce que les fromages soient fondus et légèrement dorés.'
            ],
            categoryName: 'Plat principal',
            createdAt: new Date().toISOString()
          }
        ];
        
        // Filtrer les recettes prédéfinies en fonction de la recherche
        const filteredRecipes = predefinedRecipes.filter(recipe => 
          recipe.title.toLowerCase().includes(query.toLowerCase()) ||
          recipe.description.toLowerCase().includes(query.toLowerCase()) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query.toLowerCase()))
        );
        
        searchResultsContainer.innerHTML = '';
        
        if (filteredRecipes.length > 0) {
          filteredRecipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe);
            searchResultsContainer.appendChild(recipeCard);
          });
        } else {
          searchResultsContainer.innerHTML = '<p>Aucune recette trouvée pour cette recherche.</p>';
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      searchResultsContainer.innerHTML = '<p>Erreur lors de la recherche.</p>';
    }
  };
  
  /**
   * Initialise le formulaire de recette
   * @param {Object} data - Données pour le formulaire
   */
  const initRecipeForm = async (data) => {
    if (!recipeForm) return;
    
    const { mode, recipeId } = data || {};
    
    // Réinitialiser le formulaire
    recipeForm.reset();
    ingredientsContainer.innerHTML = '';
    instructionsContainer.innerHTML = '';
    
    // Ajouter une ligne d'ingrédient et d'instruction par défaut
    addIngredientRow();
    addInstructionRow();
    
    // Charger les catégories
    await loadCategoriesForForm();
    
    if (mode === 'edit' && recipeId) {
      // Mode édition
      recipeFormTitle.textContent = 'Modifier la recette';
      await loadRecipeForEditing(recipeId);
    } else {
      // Mode création
      recipeFormTitle.textContent = 'Créer une recette';
      currentRecipe = null;
    }
  };
  
  /**
   * Charge les catégories pour le formulaire
   */
  const loadCategoriesForForm = async () => {
    const categorySelect = document.getElementById('recipe-category');
    if (!categorySelect) return;
    
    try {
      const response = await API.categories.getAll();
      const categories = response.data;
      
      categorySelect.innerHTML = '';
      
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      Utils.handleApiError(error);
    }
  };
  
  /**
   * Charge une recette pour l'édition
   * @param {string} recipeId - ID de la recette
   */
  const loadRecipeForEditing = async (recipeId) => {
    try {
      const response = await API.recipes.getById(recipeId);
      const recipe = response.data;
      currentRecipe = recipe;
      
      // Remplir le formulaire
      document.getElementById('recipe-title').value = recipe.title;
      document.getElementById('recipe-description').value = recipe.description;
      document.getElementById('recipe-category').value = recipe.categoryId;
      document.getElementById('recipe-prep-time').value = recipe.prepTime;
      document.getElementById('recipe-cook-time').value = recipe.cookTime || 0;
      document.getElementById('recipe-servings').value = recipe.servings;
      
      // Remplir les ingrédients
      ingredientsContainer.innerHTML = '';
      recipe.ingredients.forEach(ingredient => {
        addIngredientRow(ingredient);
      });
      
      // Remplir les instructions
      instructionsContainer.innerHTML = '';
      recipe.instructions.forEach(instruction => {
        addInstructionRow(instruction);
      });
      
      // Prévisualiser l'image
      if (recipe.image) {
        const imagePreview = document.getElementById('image-preview');
        imagePreview.innerHTML = `<img src="${recipe.image}" alt="Prévisualisation">`;
      }
    } catch (error) {
      Utils.handleApiError(error);
    }
  };
  
  /**
   * Ajoute une ligne d'ingrédient au formulaire
   * @param {Object} ingredient - Ingrédient existant (optionnel)
   */
  const addIngredientRow = (ingredient = null) => {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    
    row.innerHTML = `
      <input type="text" class="ingredient-name" placeholder="Nom de l'ingrédient" required value="${ingredient ? ingredient.name : ''}">
      <input type="text" class="ingredient-quantity" placeholder="Quantité" required value="${ingredient ? ingredient.quantity : ''}">
      <input type="text" class="ingredient-unit" placeholder="Unité" value="${ingredient ? ingredient.unit : ''}">
      <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
    `;
    
    ingredientsContainer.appendChild(row);
  };
  
  /**
   * Ajoute une ligne d'instruction au formulaire
   * @param {string} instruction - Instruction existante (optionnel)
   */
  const addInstructionRow = (instruction = '') => {
    const row = document.createElement('div');
    row.className = 'instruction-row';
    
    row.innerHTML = `
      <textarea class="instruction-text" placeholder="Étape de préparation" required>${instruction}</textarea>
      <button type="button" class="remove-instruction-btn"><i class="fas fa-times"></i></button>
    `;
    
    instructionsContainer.appendChild(row);
  };
  
  /**
   * Gère la soumission du formulaire de recette
   * @param {Event} e - Événement de soumission
   */
  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    
    // Récupérer les valeurs du formulaire
    const title = document.getElementById('recipe-title').value;
    const description = document.getElementById('recipe-description').value;
    const categoryId = document.getElementById('recipe-category').value;
    const prepTime = parseInt(document.getElementById('recipe-prep-time').value);
    const cookTime = parseInt(document.getElementById('recipe-cook-time').value);
    const servings = parseInt(document.getElementById('recipe-servings').value);
    
    // Récupérer les ingrédients
    const ingredients = [];
    document.querySelectorAll('.ingredient-row').forEach(row => {
      const name = row.querySelector('.ingredient-name').value;
      const quantity = row.querySelector('.ingredient-quantity').value;
      const unit = row.querySelector('.ingredient-unit').value;
      
      if (name && quantity) {
        ingredients.push({ name, quantity, unit });
      }
    });
    
    // Récupérer les instructions
    const instructions = [];
    document.querySelectorAll('.instruction-text').forEach(textarea => {
      const text = textarea.value.trim();
      if (text) {
        instructions.push(text);
      }
    });
    
    // Créer l'objet recette
    const recipeData = {
      title,
      description,
      categoryId,
      prepTime,
      cookTime,
      servings,
      ingredients,
      instructions
    };
    
    try {
      let response;
      
      if (currentRecipe) {
        // Mode édition
        response = await API.recipes.update(currentRecipe.id, recipeData);
        Utils.showNotification('Recette mise à jour avec succès', 'success');
      } else {
        // Mode création
        response = await API.recipes.create(recipeData);
        Utils.showNotification('Recette créée avec succès', 'success');
      }
      
      // Gérer l'upload d'image si présent
      const imageFile = document.getElementById('recipe-image').files[0];
      if (imageFile) {
        const recipeId = response.data.id;
        await API.recipes.addImage(recipeId, imageFile);
      }
      
      // Rediriger vers la page de détail
      Utils.navigateTo('recipe-detail-page', { recipeId: response.data.id });
    } catch (error) {
      Utils.handleApiError(error);
    }
  };
  
  /**
   * Crée une carte de recette
   * @param {Object} recipe - Données de la recette
   * @returns {HTMLElement} Élément de carte de recette
   */
  const createRecipeCard = (recipe) => {
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
      toggleFavorite(recipe.id, favoriteBtn);
    });
    
    // Vérifier si la recette est déjà en favoris
    const favorites = Utils.getFromLocalStorage('favorites', []);
    if (favorites.includes(recipe.id)) {
      favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
      favoriteBtn.classList.add('active');
    }
    
    return card;
  };
  
  /**
   * Active/désactive une recette en favoris
   * @param {string} recipeId - ID de la recette
   * @param {HTMLElement} button - Bouton de favoris
   */
  const toggleFavorite = (recipeId, button) => {
    // Si appelé depuis la page de détail
    if (!recipeId) {
      recipeId = currentRecipe.id;
      button = document.getElementById('favorite-recipe-btn');
    }
    
    const favorites = Utils.getFromLocalStorage('favorites', []);
    const index = favorites.indexOf(recipeId);
    
    if (index === -1) {
      // Ajouter aux favoris
      favorites.push(recipeId);
      button.innerHTML = '<i class="fas fa-heart"></i>';
      button.classList.add('active');
      Utils.showNotification('Recette ajoutée aux favoris', 'success');
    } else {
      // Retirer des favoris
      favorites.splice(index, 1);
      button.innerHTML = '<i class="far fa-heart"></i>';
      button.classList.remove('active');
      Utils.showNotification('Recette retirée des favoris', 'info');
    }
    
    Utils.saveToLocalStorage('favorites', favorites);
  };
  
  /**
   * Affiche une confirmation de suppression de recette
   * @param {Object} recipe - Recette à supprimer
   */
  const confirmDeleteRecipe = (recipe) => {
    const content = `
      <p>Êtes-vous sûr de vouloir supprimer la recette "${recipe.title}" ?</p>
      <p>Cette action est irréversible.</p>
      <div class="modal-actions">
        <button id="cancel-delete" class="btn btn-secondary">Annuler</button>
        <button id="confirm-delete" class="btn btn-primary">Supprimer</button>
      </div>
    `;
    
    const closeModal = Utils.showModal('Confirmer la suppression', content);
    
    document.getElementById('cancel-delete').addEventListener('click', closeModal);
    document.getElementById('confirm-delete').addEventListener('click', async () => {
      try {
        await API.recipes.delete(recipe.id);
        closeModal();
        Utils.showNotification('Recette supprimée avec succès', 'success');
        Utils.navigateTo('home-page');
      } catch (error) {
        Utils.handleApiError(error);
      }
    });
  };
  
  /**
   * Charge les recettes favorites
   */
  const loadFavorites = async () => {
    const favoritesContainer = document.getElementById('favorites-container');
    if (!favoritesContainer) return;
    
    const favorites = Utils.getFromLocalStorage('favorites', []);
    
    if (favorites.length === 0) {
      favoritesContainer.innerHTML = '<p>Vous n\'avez pas encore de recettes favorites.</p>';
      return;
    }
    
    favoritesContainer.innerHTML = '<div class="loading">Chargement des favoris...</div>';
    
    try {
      const allRecipesResponse = await API.recipes.getAll();
      const allRecipes = allRecipesResponse.data;
      
      // Filtrer les recettes favorites
      const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id));
      
      favoritesContainer.innerHTML = '';
      
      if (favoriteRecipes.length === 0) {
        favoritesContainer.innerHTML = '<p>Vous n\'avez pas encore de recettes favorites.</p>';
        return;
      }
      
      favoriteRecipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        favoritesContainer.appendChild(recipeCard);
      });
    } catch (error) {
      Utils.handleApiError(error);
      favoritesContainer.innerHTML = '<p>Erreur lors du chargement des favoris.</p>';
    }
  };
  
  return {
    init,
    loadFeaturedRecipes,
    loadLatestRecipes,
    loadRecipeDetails,
    searchRecipes,
    loadFavorites,
    createRecipeCard
  };
})();
