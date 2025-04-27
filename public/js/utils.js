/**
 * Module d'utilitaires
 * Fonctions génériques réutilisables dans l'application
 */

const Utils = (() => {
  /**
   * Affiche une notification à l'utilisateur
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification (success, error, info)
   * @param {number} duration - Durée d'affichage en ms
   */
  const showNotification = (message, type = 'info', duration = 3000) => {
    const notificationEl = document.getElementById('notification');
    const notificationContentEl = document.getElementById('notification-content');
    
    // Définir le message et le type
    notificationContentEl.textContent = message;
    notificationContentEl.className = 'notification-content ' + type;
    
    // Afficher la notification
    notificationEl.classList.remove('hidden');
    
    // Masquer la notification après la durée spécifiée
    setTimeout(() => {
      notificationEl.classList.add('hidden');
    }, duration);
  };
  
  /**
   * Affiche une modale
   * @param {string} title - Titre de la modale
   * @param {string|HTMLElement} content - Contenu de la modale (HTML ou élément DOM)
   */
  const showModal = (title, content) => {
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');
    
    // Définir le titre
    modalTitle.textContent = title;
    
    // Définir le contenu
    if (typeof content === 'string') {
      modalContent.innerHTML = content;
    } else {
      modalContent.innerHTML = '';
      modalContent.appendChild(content);
    }
    
    // Afficher la modale
    modalContainer.classList.remove('hidden');
    
    // Gérer la fermeture
    const closeModal = () => {
      modalContainer.classList.add('hidden');
    };
    
    modalClose.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        closeModal();
      }
    });
    
    // Retourner la fonction de fermeture
    return closeModal;
  };
  
  /**
   * Formate une date en format lisible
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formatée
   */
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  /**
   * Formate la durée en minutes en format lisible
   * @param {number} minutes - Durée en minutes
   * @returns {string} Durée formatée
   */
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    
    return `${hours} h ${remainingMinutes} min`;
  };
  
  /**
   * Navigue vers une page de l'application
   * @param {string} pageId - ID de la page
   * @param {Object} data - Données à passer à la page
   */
  const navigateTo = (pageId, data = {}) => {
    // Masquer toutes les pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    // Afficher la page demandée
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
      
      // Déclencher un événement pour notifier le changement de page
      const event = new CustomEvent('pageChanged', {
        detail: { pageId, data }
      });
      document.dispatchEvent(event);
      
      // Faire défiler vers le haut
      window.scrollTo(0, 0);
    }
  };
  
  /**
   * Tronque un texte à une longueur maximale
   * @param {string} text - Texte à tronquer
   * @param {number} maxLength - Longueur maximale
   * @returns {string} Texte tronqué
   */
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Génère un identifiant unique
   * @returns {string} Identifiant unique
   */
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  /**
   * Sauvegarde des données dans le localStorage
   * @param {string} key - Clé de stockage
   * @param {any} data - Données à stocker
   */
  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
  };
  
  /**
   * Récupère des données du localStorage
   * @param {string} key - Clé de stockage
   * @param {any} defaultValue - Valeur par défaut si la clé n'existe pas
   * @returns {any} Données récupérées
   */
  const getFromLocalStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Erreur lors de la récupération depuis localStorage:', error);
      return defaultValue;
    }
  };
  
  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean} True si l'utilisateur est connecté
   */
  const isLoggedIn = () => {
    return !!localStorage.getItem('token');
  };
  
  /**
   * Récupère les informations de l'utilisateur connecté
   * @returns {Object|null} Informations de l'utilisateur ou null
   */
  const getCurrentUser = () => {
    return getFromLocalStorage('user');
  };
  
  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * @param {string} role - Rôle à vérifier
   * @returns {boolean} True si l'utilisateur a le rôle
   */
  const hasRole = (role) => {
    const user = getCurrentUser();
    return user && user.role === role;
  };
  
  /**
   * Crée un élément DOM avec des attributs et du contenu
   * @param {string} tag - Tag HTML
   * @param {Object} attributes - Attributs de l'élément
   * @param {string|HTMLElement} content - Contenu de l'élément
   * @returns {HTMLElement} Élément créé
   */
  const createElement = (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    
    // Ajouter les attributs
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Ajouter le contenu
    if (typeof content === 'string') {
      element.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      element.appendChild(content);
    }
    
    return element;
  };
  
  /**
   * Gère les erreurs de l'API
   * @param {Error} error - Erreur à gérer
   */
  const handleApiError = (error) => {
    console.error('Erreur API:', error);
    
    if (error.message === 'Authentification requise') {
      // Rediriger vers la page de connexion
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showNotification('Votre session a expiré. Veuillez vous reconnecter.', 'error');
      navigateTo('login-page');
    } else {
      // Afficher une notification d'erreur
      showNotification(error.message || 'Une erreur est survenue', 'error');
    }
  };
  
  return {
    showNotification,
    showModal,
    formatDate,
    formatDuration,
    navigateTo,
    truncateText,
    generateId,
    saveToLocalStorage,
    getFromLocalStorage,
    isLoggedIn,
    getCurrentUser,
    hasRole,
    createElement,
    handleApiError
  };
})();
