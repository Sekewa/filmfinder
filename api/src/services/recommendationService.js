// src/services/recommendationService.js

// SIMULATION DE DONNÉES pour les recommandations
const MOCK_RECOMMENDATIONS = [
    { id: 5, title: "Film Recommandé 1", genre: "Drama" },
    { id: 6, title: "Film Recommandé 2", genre: "Comedy" },
    { id: 7, title: "Film Recommandé 3", genre: "Action" }
];

class RecommendationService {
    /**
     * Simule la récupération des K recommandations personnalisées.
     */
    getFilmRecommendations(userId, limit = 5) {
        // En production: la logique utiliserait l'userId pour générer des reco
        // Ici, on retourne simplement un sous-ensemble des mock data
        return MOCK_RECOMMENDATIONS.slice(0, limit);
    }
}

module.exports = new RecommendationService();