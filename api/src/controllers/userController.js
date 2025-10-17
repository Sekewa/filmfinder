// src/controllers/userController.js

const userService = require('../services/userService');

const userController = {
    getMe: async (req, res) => {
        try {
            // req.user.userId is set by authenticate middleware
            const user = await userService.getAuthenticatedUser(req.user.userId);

            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({
                    error: 'Not found',
                    message: 'Utilisateur non trouvé.'
                });
            }
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                error: 'Server error',
                message: error.message
            });
        }
    },

    patchMe: async (req, res) => {
        try {
            const updatedUser = await userService.updateMe(req.user.userId, req.body);

            if (updatedUser) {
                res.status(200).json({
                    message: 'Profil mis à jour.',
                    user: updatedUser
                });
            } else {
                res.status(404).json({
                    error: 'Not found',
                    message: 'Impossible de mettre à jour le profil.'
                });
            }
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                error: 'Server error',
                message: error.message
            });
        }
    },

    addFilmToHistory: async (req, res) => {
        try {
            const filmId = parseInt(req.params.film_id);
            const success = await userService.addFilmToHistory(req.user.userId, filmId);

            if (success) {
                res.status(200).json({
                    message: `Film ${filmId} ajouté à l'historique.`
                });
            } else {
                res.status(400).json({
                    error: 'Bad request',
                    message: 'Film déjà dans l\'historique ou film introuvable.'
                });
            }
        } catch (error) {
            console.error('Add to history error:', error);
            res.status(500).json({
                error: 'Server error',
                message: error.message
            });
        }
    },

    removeFilmFromHistory: async (req, res) => {
        try {
            const filmId = parseInt(req.params.film_id);
            const success = await userService.removeFilmFromHistory(req.user.userId, filmId);

            if (success) {
                res.status(200).json({
                    message: `Film ${filmId} retiré de l'historique.`
                });
            } else {
                res.status(400).json({
                    error: 'Bad request',
                    message: 'Film non trouvé dans l\'historique.'
                });
            }
        } catch (error) {
            console.error('Remove from history error:', error);
            res.status(500).json({
                error: 'Server error',
                message: error.message
            });
        }
    },

    addFilmToFavorites: async (req, res) => {
        try {
            const filmId = parseInt(req.params.film_id);
            const success = await userService.addFilmToFavorites(req.user.userId, filmId);

            if (success) {
                res.status(200).json({
                    message: `Film ${filmId} ajouté aux favoris.`
                });
            } else {
                res.status(400).json({
                    error: 'Bad request',
                    message: 'Film déjà dans les favoris ou film introuvable.'
                });
            }
        } catch (error) {
            console.error('Add to favorites error:', error);
            res.status(500).json({
                error: 'Server error',
                message: error.message
            });
        }
    },

    removeFilmFromFavorites: async (req, res) => {
        try {
            const filmId = parseInt(req.params.film_id);
            const success = await userService.removeFilmFromFavorites(req.user.userId, filmId);

            if (success) {
                res.status(200).json({
                    message: `Film ${filmId} retiré des favoris.`
                });
            } else {
                res.status(400).json({
                    error: 'Bad request',
                    message: 'Film non trouvé dans les favoris.'
                });
            }
        } catch (error) {
            console.error('Remove from favorites error:', error);
            res.status(500).json({
                error: 'Server error',
                message: error.message
            });
        }
    },

    addFilmToWatchlist: async (req, res) => {
        try {
            const filmId = parseInt(req.params.film_id);
            const success = await userService.addFilmToWatchlist(req.user.userId, filmId);

            if (success) {
                res.status(200).json({
                    message: `Film ${filmId} ajouté à la watchlist.`
                });
            } else {
                res.status(400).json({
                    error: 'Bad request',
                    message: 'Film déjà dans la watchlist ou film introuvable.'
                });
            }
        } catch (error) {
            console.error('Add to watchlist error:', error);
            res.status(500).json({
                error: 'Server error',
                message: error.message
            });
        }
    },

    removeFilmFromWatchlist: async (req, res) => {
        try {
            const filmId = parseInt(req.params.film_id);
            const success = await userService.removeFilmFromWatchlist(req.user.userId, filmId);

            if (success) {
                res.status(200).json({
                    message: `Film ${filmId} retiré de la watchlist.`
                });
            } else {
                res.status(400).json({
                    error: 'Bad request',
                    message: 'Film non trouvé dans la watchlist.'
                });
            }
        } catch (error) {
            console.error('Remove from watchlist error:', error);
            res.status(500).json({
                error: 'Server error',
                message: error.message
            });
        }
    }
};

module.exports = userController;