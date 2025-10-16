// src/controllers/filmController.js

const filmService = require('../services/filmService');

const filmController = {
    // GET /api/v1/films?filter=...&sort=...
    getAll: async (req, res) => {
        try {
            const data = await filmService.getAll(req.query);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).send('Erreur lors de la récupération des films.');
        }
    },

    // GET /api/v1/films/{id}
    getById: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const film = await filmService.getById(id);

            if (film) {
                res.status(200).json(film);
            } else {
                res.status(404).send('Film non trouvé.');
            }
        } catch (error) {
            res.status(500).send('Erreur lors de la récupération du film.');
        }
    }
};

module.exports = filmController;