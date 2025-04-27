/**
 * Serveur principal pour l'application de recettes de cuisine
 * @module server
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const bodyParser = require('body-parser');
const Recipe = require('./server/models/Recipe');
const Category = require('./server/models/Category');
const User = require('./server/models/User');

// Import des routes
const recipeRoutes = require('./server/routes/recipeRoutes');
const userRoutes = require('./server/routes/userRoutes');
const categoryRoutes = require('./server/routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Routes API supplémentaires pour les recettes personnelles
// Ces routes doivent être définies après les routes principales pour éviter les conflits
app.get('/api/personal-recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/personal-recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route principale pour servir l'application frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
