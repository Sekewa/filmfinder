// src/services/recommendationService.js
const { getSession } = require('../db');
const userService = require('./userService'); // Gardé pour l'historique utilisateur simulé

class RecommendationService {

    /**
     * Recommandations basées sur des films similaires (même genre, réalisateur, etc.).
     */
    async getRelatedTo(filmId, userId) {
        const session = getSession();
        const user = userService.getAuthenticatedUser(userId); // Utilise toujours les données simulées pour l'historique
        const history = user ? user.history : [];

        try {
            const result = await session.run(`
                MATCH (source:Movie {id: $filmId})
                // Trouve des films partageant le même genre
                MATCH (rec:Movie)-[:HAS_GENRE]->()<-[:HAS_GENRE]-(source)
                WHERE rec.id <> source.id AND NOT rec.id IN $history
                RETURN rec, "Partage le même genre" AS reason
                LIMIT 5
            `, { filmId, history });

            return result.records.map(record => ({
                ...record.get('rec').properties,
                reason: record.get('reason')
            }));
        } catch (error) {
            console.error("Erreur dans recommendationService.getRelatedTo:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Recommandations de "Trésors Cachés" : bien notés mais peu populaires.
     */
    async getHiddenGems(userId) {
        const session = getSession();
        const user = userService.getAuthenticatedUser(userId);
        const history = user ? user.history : [];

        try {
            const result = await session.run(`
                MATCH (m:Movie)
                WHERE m.vote_average > 8.0 AND m.vote_count < 1000 AND NOT m.id IN $history
                RETURN m ORDER BY m.vote_average DESC
                LIMIT 10
            `, { history });
            return result.records.map(r => r.get('m').properties);
        } catch (error) {
            console.error("Erreur dans recommendationService.getHiddenGems:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Recommandations par ambiance, basées sur des mots-clés.
     */
    async getByMood(keywords, userId) {
        const session = getSession();
        const user = userService.getAuthenticatedUser(userId);
        const history = user ? user.history : [];
        const keywordList = keywords.split(',').map(k => k.trim());

        try {
            const result = await session.run(`
                MATCH (m:Movie)-[:TAGGED_WITH]->(k:Keyword)
                WHERE k.name IN $keywordList AND NOT m.id IN $history
                RETURN m, COLLECT(k.name) as matchedKeywords
                LIMIT 10
            `, { keywordList, history });
            return result.records.map(r => r.get('m').properties);
        } catch (error) {
            console.error("Erreur dans recommendationService.getByMood:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Recommandations "Prochain réalisateur à suivre".
     * NOTE : Cette fonction nécessite que votre graphe contienne les réalisateurs et la relation DIRECTED.
     * Le script d'import initial ne le fait pas, cette requête est donc un exemple.
     */
    async getNextDirectorToWatch(userId) {
        const session = getSession();
        const user = userService.getAuthenticatedUser(userId);
        if (!user || user.history.length === 0) return [];
        const history = user.history;

        console.warn("La recommandation par réalisateur suppose une relation (p:Person)-[:DIRECTED]->(m:Movie) qui n'est pas dans le script d'import initial.");
        // Renvoyer un tableau vide car la structure de données n'est pas présente.
        return Promise.resolve([]);
    }
}

module.exports = new RecommendationService();