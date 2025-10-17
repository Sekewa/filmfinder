// src/routes/filmRoutes.js

const express = require('express');
const router = express.Router();
const filmController = require('../controllers/filmController');
const { authenticate } = require('../middleware/auth');

// All film routes require authentication
router.use(authenticate);

// GET /api/v1/films?filter=...&sort=...
router.get('/', filmController.getAll);

// GET /api/v1/films/{id}
router.get('/:id', filmController.getById);

module.exports = router;