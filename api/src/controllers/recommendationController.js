// src/controllers/recommendationController.js

const recommendationService = require('../services/recommendationService');

// Simuler le middleware d'authentification pour obtenir l'ID utilisateur
const mockAuth = (req, res, next) => {
    req.userId = 1; // Simuler que l'utilisateur 1 est authentifié
    next();
};

const recommendationController = {
    // GET /api/v1/recommendations/films
    getFilms: [mockAuth, (req, res) => {
        const limit = parseInt(req.query.limit) || 5; 
        const userId = req.userId;
        
        const recommendations = recommendationService.getFilmRecommendations(userId, limit);

        res.status(200).json(recommendations);
    }]
};

module.exports = recommendationController;