// src/routes/recommendationRoutes.js

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// GET /api/v1/recommendations/related-to/{film_id}
router.get('/related-to/:film_id', recommendationController.getRelatedTo);

// GET /api/v1/recommendations/hidden-gems
router.get('/hidden-gems', recommendationController.getHiddenGems);

// GET /api/v1/recommendations/by-mood?keywords=...
router.get('/by-mood', recommendationController.getByMood);

// GET /api/v1/recommendations/next-director-to-watch
router.get('/next-director-to-watch', recommendationController.getNextDirectorToWatch);

module.exports = router;