const express = require('express');
const cors = require('cors'); // Importation du package cors

// Importation des routeurs
const userRoutes = require('./src/routes/userRoutes'); 
const filmRoutes = require('./src/routes/filmRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');

const app = express();
const port = 3000;

// Configuration de CORS pour autoriser spécifiquement votre frontend
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200 // Pour les navigateurs plus anciens
};

app.use(cors(corsOptions));

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