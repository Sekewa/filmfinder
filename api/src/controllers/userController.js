// src/controllers/userController.js

const userService = require('../services/userService');

const mockAuth = (req, res, next) => {
    req.userId = 1;
    next();
};

const userController = {
    create: (req, res) => {
        const newUser = userService.create(req.body);
        if (newUser) {
            res.status(201).json({ message: 'Inscription réussie.', user: newUser });
        } else {
            res.status(400).send('Email et mot de passe sont requis pour l\'inscription.');
        }
    },
    
    getMe: [mockAuth, (req, res) => {
        const user = userService.getAuthenticatedUser(req.userId);
        if (user) {
            const { password, ...profile } = user;
            res.status(200).json(profile);
        } else {
            res.status(404).send('Utilisateur non trouvé.');
        }
    }],
    
    patchMe: [mockAuth, (req, res) => {
        const updatedUser = userService.updateMe(req.userId, req.body);
        if (updatedUser) {
            const { password, ...profile } = updatedUser;
            res.status(200).json({ message: 'Profil mis à jour.', user: profile });
        } else {
            res.status(404).send('Impossible de mettre à jour le profil.');
        }
    }],

    addFilmToHistory: [mockAuth, (req, res) => {
        const filmId = parseInt(req.params.film_id);
        if (userService.addFilmToHistory(req.userId, filmId)) {
            res.status(200).send(`Film ${filmId} ajouté à l'historique.`);
        } else {
            res.status(400).send('Action impossible.');
        }
    }],

    removeFilmFromHistory: [mockAuth, (req, res) => {
        const filmId = parseInt(req.params.film_id);
        if (userService.removeFilmFromHistory(req.userId, filmId)) {
            res.status(200).send(`Film ${filmId} retiré de l'historique.`);
        } else {
            res.status(400).send('Action impossible.');
        }
    }]
};

module.exports = userController;