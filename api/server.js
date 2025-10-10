// api/server.js (MIS À JOUR)

const express = require('express');
// Importation des routeurs
const userRoutes = require('./src/routes/userRoutes'); 
const filmRoutes = require('./src/routes/filmRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');

const app = express();
const port = 3000;

// Middleware : permet à Express de lire le corps des requêtes en JSON
app.use(express.json());

// 1. Route de base
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API REST structurée !');
});

// 2. Montage des routes spécifiques (sous le préfixe /api/v1)
const API_V1 = '/api/v1';

app.use(`${API_V1}/users`, userRoutes);
app.use(`${API_V1}/films`, filmRoutes);
app.use(`${API_V1}/recommendations`, recommendationRoutes);

// 3. Démarrage du Serveur
app.listen(port, () => {
    console.log(`🚀 API REST en cours d'exécution sur http://localhost:${port}`);
    console.log(`Endpoints montés sur: 
    - ${API_V1}/users
    - ${API_V1}/films
    - ${API_V1}/recommendations`);
});