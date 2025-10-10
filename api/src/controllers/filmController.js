// src/controllers/filmController.js

const filmService = require('../services/filmService');

const filmController = {
    // GET /api/v1/films?filter=...&sort=...
    getAll: (req, res) => {
        const data = filmService.getAll(req.query);
        res.status(200).json(data);
    },

    // GET /api/v1/films/{id}
    getById: (req, res) => {
        const id = parseInt(req.params.id);
        const film = filmService.getById(id);

        if (film) {
            res.status(200).json(film);
        } else {
            res.status(404).send('Film non trouvé.');
        }
    }
};

module.exports = filmController;