// src/controllers/recommendationController.js

const recommendationService = require('../services/recommendationService');

// Simuler le middleware d'authentification pour obtenir l'ID utilisateur
const mockAuth = (req, res, next) => {
    req.userId = 1; // Simuler que l'utilisateur 1 est authentifié
    next();
};

const recommendationController = {
    getRelatedTo: [mockAuth, async (req, res) => {
        try {
            const filmId = parseInt(req.params.film_id);
            const recommendations = await recommendationService.getRelatedTo(filmId, req.userId);
            res.status(200).json(recommendations);
        } catch (error) {
            res.status(500).send('Erreur serveur.');
        }
    }],

    getHiddenGems: [mockAuth, async (req, res) => {
        try {
            const recommendations = await recommendationService.getHiddenGems(req.userId);
            res.status(200).json(recommendations);
        } catch (error) {
            res.status(500).send('Erreur serveur.');
        }
    }],

    getByMood: [mockAuth, async (req, res) => {
        try {
            const { keywords } = req.query;
            if (!keywords) {
                return res.status(400).send('Le paramètre "keywords" est requis.');
            }
            const recommendations = await recommendationService.getByMood(keywords, req.userId);
            res.status(200).json(recommendations);
        } catch (error) {
            res.status(500).send('Erreur serveur.');
        }
    }],

    getNextDirectorToWatch: [mockAuth, async (req, res) => {
        try {
            const recommendations = await recommendationService.getNextDirectorToWatch(req.userId);
            res.status(200).json(recommendations);
        } catch (error) {
            res.status(500).send('Erreur serveur.');
        }
    }]
};

module.exports = recommendationController;