// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

// GET /api/v1/users/me (Profil)
router.get('/me', userController.getMe);

// PATCH /api/v1/users/me (Mise à jour partielle)
router.patch('/me', userController.patchMe);

// PUT /api/v1/users/me/history/films/{film_id} (Ajout film vu)
router.put('/me/history/films/:film_id', userController.addFilmToHistory);

// DELETE /api/v1/users/me/history/films/{film_id} (Retrait film vu)
router.delete('/me/history/films/:film_id', userController.removeFilmFromHistory);

// PUT /api/v1/users/me/favorites/films/{film_id} (Ajout aux favoris)
router.put('/me/favorites/films/:film_id', userController.addFilmToFavorites);

// DELETE /api/v1/users/me/favorites/films/{film_id} (Retrait des favoris)
router.delete('/me/favorites/films/:film_id', userController.removeFilmFromFavorites);

// PUT /api/v1/users/me/watchlist/films/{film_id} (Ajout à la watchlist)
router.put('/me/watchlist/films/:film_id', userController.addFilmToWatchlist);

// DELETE /api/v1/users/me/watchlist/films/{film_id} (Retrait de la watchlist)
router.delete('/me/watchlist/films/:film_id', userController.removeFilmFromWatchlist);

module.exports = router;