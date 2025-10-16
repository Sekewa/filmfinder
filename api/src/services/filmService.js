// src/services/filmService.js
const { getSession } = require('../db');

class FilmService {
    /**
     * Récupère une liste de films depuis la base de données.
     * En production, cette méthode devrait inclure la pagination, le filtrage et le tri.
     */
    async getAll(params) {
        const session = getSession();
        try {
            // Pour la simplicité, le filtrage et le tri ne sont pas implémentés ici.
            const result = await session.run(
                'MATCH (m:Movie) RETURN m ORDER BY m.popularity DESC LIMIT 25'
            );
            return result.records.map(record => record.get('m').properties);
        } catch (error) {
            console.error("Erreur dans filmService.getAll:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Récupère un film par son ID.
     */
    async getById(id) {
        const session = getSession();
        try {
            const result = await session.run(
                'MATCH (m:Movie {id: $id}) RETURN m',
                { id }
            );
            if (result.records.length === 0) {
                return null;
            }
            return result.records[0].get('m').properties;
        } catch (error) {
            console.error("Erreur dans filmService.getById:", error);
            throw error;
        } finally {
            await session.close();
        }
    }
}

module.exports = new FilmService();