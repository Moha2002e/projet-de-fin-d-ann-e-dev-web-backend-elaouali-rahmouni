/**
 * Module principal de l'application
 * Point d'entrée qui initialise tous les autres modules
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialiser les modules
  Auth.init();
  Recipes.init();
  Categories.init();
  
  // Initialiser la navigation
  initNavigation();
  
  // Charger la page d'accueil par défaut
  Utils.navigateTo('home-page');
  
  // Initialiser les événements de la barre de navigation
  initNavbarEvents();
});

/**
 * Initialise la navigation entre les pages
 */
const initNavigation = () => {
  // Liens de navigation principaux
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.id === 'categories-link') {
        e.preventDefault();
        Utils.navigateTo('categories-page');
      } else if (link.id === 'favorites-link') {
        e.preventDefault();
        Utils.navigateTo('favorites-page');
        Recipes.loadFavorites();
      }
    });
  });
  
  // Événement pour les boutons de favoris
  document.getElementById('favorites-link').addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!Utils.isLoggedIn()) {
      Utils.showNotification('Veuillez vous connecter pour accéder à vos favoris', 'info');
      Utils.navigateTo('login-page');
      return;
    }
    
    Utils.navigateTo('favorites-page');
    Recipes.loadFavorites();
  });
};

/**
 * Initialise les événements de la barre de navigation
 */
const initNavbarEvents = () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
};
