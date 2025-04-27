/**
 * Modèle de données pour les utilisateurs
 * @module models/User
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Chemin vers le fichier JSON qui stockera nos utilisateurs
const usersFilePath = path.join(__dirname, '../../data/users.json');

// Assurons-nous que le dossier data existe
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Assurons-nous que le fichier users.json existe
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
}

/**
 * Classe représentant le modèle d'utilisateur
 */
class User {
  /**
   * Récupère tous les utilisateurs
   * @returns {Promise<Array>} Liste des utilisateurs
   */
  static async findAll() {
    try {
      const data = await fs.promises.readFile(usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors de la lecture des utilisateurs:', error);
      return [];
    }
  }

  /**
   * Récupère un utilisateur par son ID
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<Object|null>} L'utilisateur trouvé ou null
   */
  static async findById(id) {
    try {
      const users = await this.findAll();
      return users.find(user => user.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupère un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object|null>} L'utilisateur trouvé ou null
   */
  static async findByEmail(email) {
    try {
      const users = await this.findAll();
      return users.find(user => user.email === email) || null;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur par email:', error);
      return null;
    }
  }

  /**
   * Crée un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>} L'utilisateur créé
   */
  static async create(userData) {
    try {
      const users = await this.findAll();
      
      // Vérifier si l'email existe déjà
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        password: hashedPassword,
        role: userData.role || 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Supprimer le mot de passe en clair
      delete newUser.plainPassword;
      
      users.push(newUser);
      await fs.promises.writeFile(usersFilePath, JSON.stringify(users, null, 2));
      
      // Ne pas renvoyer le mot de passe
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Met à jour un utilisateur existant
   * @param {string} id - ID de l'utilisateur à mettre à jour
   * @param {Object} userData - Nouvelles données de l'utilisateur
   * @returns {Promise<Object|null>} L'utilisateur mis à jour ou null
   */
  static async update(id, userData) {
    try {
      const users = await this.findAll();
      const index = users.findIndex(user => user.id === id);
      
      if (index === -1) return null;
      
      // Si le mot de passe est fourni, le hasher
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      
      const updatedUser = {
        ...users[index],
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      users[index] = updatedUser;
      await fs.promises.writeFile(usersFilePath, JSON.stringify(users, null, 2));
      
      // Ne pas renvoyer le mot de passe
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Supprime un utilisateur
   * @param {string} id - ID de l'utilisateur à supprimer
   * @returns {Promise<boolean>} True si supprimé, false sinon
   */
  static async delete(id) {
    try {
      const users = await this.findAll();
      const filteredUsers = users.filter(user => user.id !== id);
      
      if (filteredUsers.length === users.length) return false;
      
      await fs.promises.writeFile(usersFilePath, JSON.stringify(filteredUsers, null, 2));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Authentifie un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @returns {Promise<Object|null>} L'utilisateur authentifié avec token ou null
   */
  static async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);
      
      if (!user) return null;
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) return null;
      
      // Générer un token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      
      // Ne pas renvoyer le mot de passe
      const { password: pwd, ...userWithoutPassword } = user;
      
      return {
        ...userWithoutPassword,
        token
      };
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      throw error;
    }
  }
}

module.exports = User;
