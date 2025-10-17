// src/routes/recommendationRoutes.js

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate } = require('../middleware/auth');

// All recommendation routes require authentication
router.use(authenticate);

// GET /api/v1/recommendations/related-to/{film_id}
router.get('/related-to/:film_id', recommendationController.getRelatedTo);

// GET /api/v1/recommendations/hidden-gems
router.get('/hidden-gems', recommendationController.getHiddenGems);

// GET /api/v1/recommendations/by-mood?keywords=...
router.get('/by-mood', recommendationController.getByMood);

// GET /api/v1/recommendations/next-director-to-watch
router.get('/next-director-to-watch', recommendationController.getNextDirectorToWatch);

// GET /api/v1/recommendations/by-production-company/{film_id}
router.get('/by-production-company/:film_id', recommendationController.getByProductionCompany);

// GET /api/v1/recommendations/trending?limit=20
router.get('/trending', recommendationController.getTrending);

// GET /api/v1/recommendations/decade-classics?decade=1990&limit=15
router.get('/decade-classics', recommendationController.getDecadeClassics);

// GET /api/v1/recommendations/genre-discovery?limit=5
router.get('/genre-discovery', recommendationController.getGenreDiscovery);

// GET /api/v1/recommendations/personalized?limit=5
router.get('/personalized', recommendationController.getPersonalized);

module.exports = router;