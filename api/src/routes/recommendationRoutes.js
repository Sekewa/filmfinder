// src/routes/recommendationRoutes.js

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// GET /api/v1/recommendations/films
router.get('/films', recommendationController.getFilms);

module.exports = router;