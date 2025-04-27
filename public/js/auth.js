/**
 * Module d'authentification
 * Gère l'inscription, la connexion et la gestion du profil utilisateur
 */

const Auth = (() => {
  // Éléments DOM
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const toLoginLink = document.getElementById('to-login-link');
  const toRegisterLink = document.getElementById('to-register-link');
  const logoutLink = document.getElementById('logout-link');
  const profileLink = document.getElementById('profile-link');
  const authLinks = document.querySelector('.auth-links');
  const userProfile = document.querySelector('.user-profile');
  const userName = document.getElementById('user-name');
  const addRecipeButton = document.getElementById('add-recipe-button');
  
  /**
   * Initialise le module d'authentification
   */
  const init = () => {
    // Vérifier si l'utilisateur est déjà connecté
    updateAuthUI();
    
    // Événements des formulaires
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegister);
    }
    
    // Événements des liens de navigation
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        Utils.navigateTo('login-page');
      });
    }
    
    if (registerLink) {
      registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        Utils.navigateTo('register-page');
      });
    }
    
    if (toLoginLink) {
      toLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        Utils.navigateTo('login-page');
      });
    }
    
    if (toRegisterLink) {
      toRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        Utils.navigateTo('register-page');
      });
    }
    
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
    
    if (profileLink) {
      profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        Utils.navigateTo('profile-page');
        loadUserProfile();
      });
    }
  };
  
  /**
   * Met à jour l'interface utilisateur en fonction de l'état d'authentification
   */
  const updateAuthUI = () => {
    const isLoggedIn = Utils.isLoggedIn();
    const currentUser = Utils.getCurrentUser();
    
    if (isLoggedIn && currentUser) {
      // Utilisateur connecté
      if (authLinks) authLinks.classList.add('hidden');
      if (userProfile) userProfile.classList.remove('hidden');
      if (userName) userName.textContent = currentUser.name;
      if (addRecipeButton) addRecipeButton.classList.remove('hidden');
    } else {
      // Utilisateur non connecté
      if (authLinks) authLinks.classList.remove('hidden');
      if (userProfile) userProfile.classList.add('hidden');
      if (addRecipeButton) addRecipeButton.classList.add('hidden');
    }
  };
  
  /**
   * Gère la soumission du formulaire de connexion
   * @param {Event} e - Événement de soumission
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const response = await API.users.login({ email, password });
      
      // Stocker le token et les informations utilisateur
      localStorage.setItem('token', response.data.token);
      Utils.saveToLocalStorage('user', response.data);
      
      // Mettre à jour l'interface
      updateAuthUI();
      
      // Notification et redirection
      Utils.showNotification('Connexion réussie', 'success');
      Utils.navigateTo('home-page');
    } catch (error) {
      Utils.handleApiError(error);
    }
  };
  
  /**
   * Gère la soumission du formulaire d'inscription
   * @param {Event} e - Événement de soumission
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      Utils.showNotification('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    try {
      const response = await API.users.register({ name, email, password });
      
      // Notification et redirection
      Utils.showNotification('Inscription réussie. Vous pouvez maintenant vous connecter.', 'success');
      Utils.navigateTo('login-page');
    } catch (error) {
      Utils.handleApiError(error);
    }
  };
  
  /**
   * Déconnecte l'utilisateur
   */
  const logout = () => {
    // Supprimer le token et les informations utilisateur
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Mettre à jour l'interface
    updateAuthUI();
    
    // Notification et redirection
    Utils.showNotification('Vous êtes déconnecté', 'info');
    Utils.navigateTo('home-page');
  };
  
  /**
   * Charge le profil de l'utilisateur
   */
  const loadUserProfile = async () => {
    if (!Utils.isLoggedIn()) {
      Utils.navigateTo('login-page');
      return;
    }
    
    try {
      // Récupérer les informations de profil
      const response = await API.users.getProfile();
      const user = response.data;
      
      // Mettre à jour l'interface du profil
      document.getElementById('profile-name').textContent = user.name;
      document.getElementById('profile-email').textContent = user.email;
      
      // Charger les recettes de l'utilisateur
      loadUserRecipes();
    } catch (error) {
      Utils.handleApiError(error);
    }
  };
  
  /**
   * Charge les recettes de l'utilisateur
   */
  const loadUserRecipes = async () => {
    try {
      const recipes = await API.recipes.getAll();
      const currentUser = Utils.getCurrentUser();
      
      if (!currentUser) return;
      
      // Filtrer les recettes de l'utilisateur
      const userRecipes = recipes.data.filter(recipe => recipe.userId === currentUser.id);
      
      const userRecipesContainer = document.getElementById('user-recipes-container');
      userRecipesContainer.innerHTML = '';
      
      if (userRecipes.length === 0) {
        userRecipesContainer.innerHTML = '<p>Vous n\'avez pas encore créé de recettes.</p>';
        return;
      }
      
      // Afficher les recettes de l'utilisateur
      userRecipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe, true);
        userRecipesContainer.appendChild(recipeCard);
      });
    } catch (error) {
      Utils.handleApiError(error);
    }
  };
  
  /**
   * Crée une carte de recette
   * @param {Object} recipe - Données de la recette
   * @param {boolean} isEditable - Si la recette est éditable
   * @returns {HTMLElement} Élément de carte de recette
   */
  const createRecipeCard = (recipe, isEditable = false) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const imageUrl = recipe.image || 'images/recipe-placeholder.jpg';
    
    card.innerHTML = `
      <div class="recipe-image" style="background-image: url('${imageUrl}')"></div>
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.title}</h3>
        <p class="recipe-description">${Utils.truncateText(recipe.description, 100)}</p>
        <div class="recipe-meta">
          <div class="recipe-time">
            <i class="fas fa-clock"></i> ${Utils.formatDuration(recipe.prepTime + (recipe.cookTime || 0))}
          </div>
          <div class="recipe-category">
            <i class="fas fa-tag"></i> ${recipe.categoryName || 'Non catégorisé'}
          </div>
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary view-recipe-btn" data-id="${recipe.id}">Voir</button>
          ${isEditable ? `
            <button class="btn btn-secondary edit-recipe-btn" data-id="${recipe.id}">Modifier</button>
            <button class="btn btn-secondary delete-recipe-btn" data-id="${recipe.id}">Supprimer</button>
          ` : ''}
        </div>
      </div>
    `;
    
    // Ajouter les événements
    card.querySelector('.view-recipe-btn').addEventListener('click', () => {
      Utils.navigateTo('recipe-detail-page', { recipeId: recipe.id });
    });
    
    if (isEditable) {
      card.querySelector('.edit-recipe-btn').addEventListener('click', () => {
        Utils.navigateTo('recipe-form-page', { recipeId: recipe.id, mode: 'edit' });
      });
      
      card.querySelector('.delete-recipe-btn').addEventListener('click', () => {
        confirmDeleteRecipe(recipe);
      });
    }
    
    return card;
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
        loadUserRecipes();
      } catch (error) {
        Utils.handleApiError(error);
      }
    });
  };
  
  return {
    init,
    updateAuthUI,
    loadUserProfile,
    createRecipeCard
  };
})();
