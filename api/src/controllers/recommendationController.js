// src/controllers/recommendationController.js

const recommendationService = require('../services/recommendationService');

const recommendationController = {
    getRelatedTo: async (req, res) => {
        try {
            const filmId = parseInt(req.params.film_id);
            const recommendations = await recommendationService.getRelatedTo(filmId, req.user.userId);
            res.status(200).json(recommendations);
        } catch (error) {
            console.error('Error in getRelatedTo:', error);
            res.status(500).json({ error: 'Erreur serveur.', message: error.message });
        }
    },

    getHiddenGems: async (req, res) => {
        try {
            const recommendations = await recommendationService.getHiddenGems(req.user.userId);
            res.status(200).json(recommendations);
        } catch (error) {
            console.error('Error in getHiddenGems:', error);
            res.status(500).json({ error: 'Erreur serveur.', message: error.message });
        }
    },

    getByMood: async (req, res) => {
        try {
            const { keywords } = req.query;
            if (!keywords) {
                return res.status(400).json({ error: 'Le paramètre "keywords" est requis.' });
            }
            const recommendations = await recommendationService.getByMood(keywords, req.user.userId);
            res.status(200).json(recommendations);
        } catch (error) {
            console.error('Error in getByMood:', error);
            res.status(500).json({ error: 'Erreur serveur.', message: error.message });
        }
    },

    getNextDirectorToWatch: async (req, res) => {
        try {
            const recommendations = await recommendationService.getNextDirectorToWatch(req.user.userId);
            res.status(200).json(recommendations);
        } catch (error) {
            console.error('Error in getNextDirectorToWatch:', error);
            res.status(500).json({ error: 'Erreur serveur.', message: error.message });
        }
    },

    getByProductionCompany: async (req, res) => {
        try {
            const filmId = parseInt(req.params.film_id);
            const recommendations = await recommendationService.getByProductionCompany(filmId, req.user.userId);
            res.status(200).json(recommendations);
        } catch (error) {
            console.error('Error in getByProductionCompany:', error);
            res.status(500).json({ error: 'Erreur serveur.', message: error.message });
        }
    },

    getTrending: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const recommendations = await recommendationService.getTrending(req.user.userId, limit);
            res.status(200).json(recommendations);
        } catch (error) {
            console.error('Error in getTrending:', error);
            res.status(500).json({ error: 'Erreur serveur.', message: error.message });
        }
    },

    getDecadeClassics: async (req, res) => {
        try {
            const { decade } = req.query;
            if (!decade) {
                return res.status(400).json({ error: 'Le paramètre "decade" est requis (ex: 1990).' });
            }
            const limit = parseInt(req.query.limit) || 15;
            const recommendations = await recommendationService.getDecadeClassics(decade, req.user.userId, limit);
            res.status(200).json(recommendations);
        } catch (error) {
            console.error('Error in getDecadeClassics:', error);
            res.status(500).json({ error: 'Erreur serveur.', message: error.message });
        }
    },

    getGenreDiscovery: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const recommendations = await recommendationService.getGenreDiscovery(req.user.userId, limit);
            res.status(200).json(recommendations);
        } catch (error) {
            console.error('Error in getGenreDiscovery:', error);
            res.status(500).json({ error: 'Erreur serveur.', message: error.message });
        }
    },

    getPersonalized: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const recommendations = await recommendationService.getPersonalizedRecommendations(req.user.userId, limit);
            res.status(200).json(recommendations);
        } catch (error) {
            console.error('Error in getPersonalized:', error);
            res.status(500).json({ error: 'Erreur serveur.', message: error.message });
        }
    }
};

module.exports = recommendationController;