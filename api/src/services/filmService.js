// src/services/filmService.js
const { getSession } = require('../db');
const neo4j = require('neo4j-driver');

class FilmService {
    /**
     * Récupère une liste de films depuis la base de données avec pagination et filtres.
     */
    async getAll(params) {
        const session = getSession();
        // Gère la pagination avec des valeurs par défaut
        const page = parseInt(params.page, 10) || 1;
        const limit = parseInt(params.limit, 10) || 25;
        const skip = (page - 1) * limit;

        try {
            const result = await session.run(
                `MATCH (m:Movie)
                 WHERE m.adult = false
                 RETURN m 
                 ORDER BY m.popularity DESC 
                 SKIP $skip 
                 LIMIT $limit`,
                {
                    skip: neo4j.int(skip),
                    limit: neo4j.int(limit)
                }
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
                'MATCH (m:Movie {id: $id}) WHERE m.adult = false RETURN m',
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