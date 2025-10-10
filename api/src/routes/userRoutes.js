// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/v1/users (Inscription)
router.post('/', userController.create);

// GET /api/v1/users/me (Profil)
router.get('/me', userController.getMe);

// PATCH /api/v1/users/me (Mise à jour partielle)
router.patch('/me', userController.patchMe);

// PUT /api/v1/users/me/history/films/{film_id} (Ajout film vu)
router.put('/me/history/films/:film_id', userController.addFilmToHistory);

// DELETE /api/v1/users/me/history/films/{film_id} (Retrait film vu)
router.delete('/me/history/films/:film_id', userController.removeFilmFromHistory);

module.exports = router;