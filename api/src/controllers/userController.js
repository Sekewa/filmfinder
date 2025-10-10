// src/controllers/userController.js

const userService = require('../services/userService');

// Middleware de simulation d'authentification
const mockAuth = (req, res, next) => {
    // En production, cette logique récupère l'ID utilisateur à partir du token JWT
    req.userId = 1; // Simuler que l'utilisateur 1 est authentifié
    next();
};

const userController = {
    // POST /api/v1/users (Inscription)
    create: (req, res) => {
        const newUser = userService.create(req.body);

        if (newUser) {
            res.status(201).json({ message: 'Inscription réussie.', user: newUser });
        } else {
            res.status(400).send('Email et mot de passe sont requis pour l\'inscription.');
        }
    },
    
    // GET /api/v1/users/me (Profil)
    getMe: [mockAuth, (req, res) => {
        const user = userService.getAuthenticatedUser(req.userId); 

        if (user) {
            const { password, ...profile } = user;
            res.status(200).json(profile);
        } else {
            res.status(404).send('Utilisateur non trouvé.');
        }
    }],
    
    // PATCH /api/v1/users/me (Mise à jour partielle)
    patchMe: [mockAuth, (req, res) => {
        const updatedUser = userService.updateMe(req.userId, req.body);

        if (updatedUser) {
            const { password, ...profile } = updatedUser;
            res.status(200).json({ message: 'Profil mis à jour.', user: profile });
        } else {
            res.status(404).send('Impossible de mettre à jour le profil.');
        }
    }],

    // PUT /api/v1/users/me/history/films/{film_id}
    addFilmToHistory: [mockAuth, (req, res) => {
        const filmId = parseInt(req.params.film_id);

        if (userService.addFilmToHistory(req.userId, filmId)) {
            res.status(200).send(`Film ${filmId} ajouté à l'historique.`);
        } else {
            res.status(400).send('Action impossible (film ou utilisateur non trouvé, ou déjà dans l\'historique).');
        }
    }],

    // DELETE /api/v1/users/me/history/films/{film_id}
    removeFilmFromHistory: [mockAuth, (req, res) => {
        const filmId = parseInt(req.params.film_id);

        if (userService.removeFilmFromHistory(req.userId, filmId)) {
            res.status(200).send(`Film ${filmId} retiré de l'historique.`);
        } else {
            res.status(400).send('Action impossible (film ou utilisateur non trouvé, ou pas dans l\'historique).');
        }
    }]
};

module.exports = userController;