// src/services/userService.js
const neo4j = require('neo4j-driver');
const { getSession } = require('../db');

class UserService {
    /**
     * Get user with their watch history, favorites, and watchlist
     * @param {string} userId - User ID
     * @returns {Object} User object with history, favorites, and watchlist arrays
     */
    async getAuthenticatedUser(userId) {
        const session = getSession();

        try {
            const result = await session.run(
                `MATCH (u:User {id: $userId})
                OPTIONAL MATCH (u)-[w:WATCHED]->(watched:Movie)
                OPTIONAL MATCH (u)-[f:FAVORITED]->(favorited:Movie)
                OPTIONAL MATCH (u)-[wl:WATCHLISTED]->(watchlisted:Movie)
                RETURN u,
                    collect(DISTINCT {id: watched.id, watchedAt: w.watchedAt}) as history,
                    collect(DISTINCT {id: favorited.id, favoritedAt: f.favoritedAt}) as favorites,
                    collect(DISTINCT {id: watchlisted.id, watchlistedAt: wl.watchlistedAt}) as watchlist`,
                { userId }
            );

            if (result.records.length === 0) {
                return null;
            }

            const record = result.records[0];
            const user = record.get('u').properties;

            const history = record.get('history')
                .filter(h => h.id !== null)
                .map(h => typeof h.id === 'object' ? h.id.low : h.id);

            const favorites = record.get('favorites')
                .filter(f => f.id !== null)
                .map(f => typeof f.id === 'object' ? f.id.low : f.id);

            const watchlist = record.get('watchlist')
                .filter(w => w.id !== null)
                .map(w => typeof w.id === 'object' ? w.id.low : w.id);

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                history,
                favorites,
                watchlist
            };
        } finally {
            await session.close();
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} data - Data to update (name, email)
     * @returns {Object} Updated user object
     */
    async updateMe(userId, data) {
        const session = getSession();

        try {
            const updates = [];
            const params = { userId };

            if (data.name) {
                updates.push('u.name = $name');
                params.name = data.name;
            }

            if (data.email) {
                updates.push('u.email = $email');
                params.email = data.email;
            }

            if (updates.length === 0) {
                return await this.getAuthenticatedUser(userId);
            }

            const result = await session.run(
                `MATCH (u:User {id: $userId})
                SET ${updates.join(', ')}
                RETURN u`,
                params
            );

            if (result.records.length === 0) {
                return null;
            }

            const user = result.records[0].get('u').properties;

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            };
        } finally {
            await session.close();
        }
    }

    /**
     * Add film to user's watch history
     * @param {string} userId - User ID
     * @param {number} filmId - Film ID
     * @returns {boolean} Success status
     */
    async addFilmToHistory(userId, filmId) {
        const session = getSession();

        try {
            // Check if relationship already exists
            const checkResult = await session.run(
                `MATCH (u:User {id: $userId})-[w:WATCHED]->(m:Movie)
                WHERE m.id = $filmId
                RETURN w`,
                { userId, filmId: neo4j.int(filmId) }
            );

            if (checkResult.records.length > 0) {
                return false; // Already in history
            }

            // Create WATCHED relationship
            const result = await session.run(
                `MATCH (u:User {id: $userId})
                MATCH (m:Movie)
                WHERE m.id = $filmId
                CREATE (u)-[w:WATCHED {watchedAt: datetime()}]->(m)
                RETURN w`,
                { userId, filmId: neo4j.int(filmId) }
            );

            return result.records.length > 0;
        } finally {
            await session.close();
        }
    }

    /**
     * Remove film from user's watch history
     * @param {string} userId - User ID
     * @param {number} filmId - Film ID
     * @returns {boolean} Success status
     */
    async removeFilmFromHistory(userId, filmId) {
        const session = getSession();

        try {
            const result = await session.run(
                `MATCH (u:User {id: $userId})-[w:WATCHED]->(m:Movie)
                WHERE m.id = $filmId
                DELETE w
                RETURN count(w) as deleted`,
                { userId, filmId: neo4j.int(filmId) }
            );

            const deleted = result.records[0].get('deleted');
            return typeof deleted === 'object' ? deleted.low > 0 : deleted > 0;
        } finally {
            await session.close();
        }
    }

    /**
     * Add film to user's favorites
     * @param {string} userId - User ID
     * @param {number} filmId - Film ID
     * @returns {boolean} Success status
     */
    async addFilmToFavorites(userId, filmId) {
        const session = getSession();

        try {
            // Check if relationship already exists
            const checkResult = await session.run(
                `MATCH (u:User {id: $userId})-[f:FAVORITED]->(m:Movie)
                WHERE m.id = $filmId
                RETURN f`,
                { userId, filmId: neo4j.int(filmId) }
            );

            if (checkResult.records.length > 0) {
                return false; // Already in favorites
            }

            // Create FAVORITED relationship
            const result = await session.run(
                `MATCH (u:User {id: $userId})
                MATCH (m:Movie)
                WHERE m.id = $filmId
                CREATE (u)-[f:FAVORITED {favoritedAt: datetime()}]->(m)
                RETURN f`,
                { userId, filmId: neo4j.int(filmId) }
            );

            return result.records.length > 0;
        } finally {
            await session.close();
        }
    }

    /**
     * Remove film from user's favorites
     * @param {string} userId - User ID
     * @param {number} filmId - Film ID
     * @returns {boolean} Success status
     */
    async removeFilmFromFavorites(userId, filmId) {
        const session = getSession();

        try {
            const result = await session.run(
                `MATCH (u:User {id: $userId})-[f:FAVORITED]->(m:Movie)
                WHERE m.id = $filmId
                DELETE f
                RETURN count(f) as deleted`,
                { userId, filmId: neo4j.int(filmId) }
            );

            const deleted = result.records[0].get('deleted');
            return typeof deleted === 'object' ? deleted.low > 0 : deleted > 0;
        } finally {
            await session.close();
        }
    }

    /**
     * Add film to user's watchlist
     * @param {string} userId - User ID
     * @param {number} filmId - Film ID
     * @returns {boolean} Success status
     */
    async addFilmToWatchlist(userId, filmId) {
        const session = getSession();

        try {
            // Check if relationship already exists
            const checkResult = await session.run(
                `MATCH (u:User {id: $userId})-[wl:WATCHLISTED]->(m:Movie)
                WHERE m.id = $filmId
                RETURN wl`,
                { userId, filmId: neo4j.int(filmId) }
            );

            if (checkResult.records.length > 0) {
                return false; // Already in watchlist
            }

            // Create WATCHLISTED relationship
            const result = await session.run(
                `MATCH (u:User {id: $userId})
                MATCH (m:Movie)
                WHERE m.id = $filmId
                CREATE (u)-[wl:WATCHLISTED {watchlistedAt: datetime()}]->(m)
                RETURN wl`,
                { userId, filmId: neo4j.int(filmId) }
            );

            return result.records.length > 0;
        } finally {
            await session.close();
        }
    }

    /**
     * Remove film from user's watchlist
     * @param {string} userId - User ID
     * @param {number} filmId - Film ID
     * @returns {boolean} Success status
     */
    async removeFilmFromWatchlist(userId, filmId) {
        const session = getSession();

        try {
            const result = await session.run(
                `MATCH (u:User {id: $userId})-[wl:WATCHLISTED]->(m:Movie)
                WHERE m.id = $filmId
                DELETE wl
                RETURN count(wl) as deleted`,
                { userId, filmId: neo4j.int(filmId) }
            );

            const deleted = result.records[0].get('deleted');
            return typeof deleted === 'object' ? deleted.low > 0 : deleted > 0;
        } finally {
            await session.close();
        }
    }
}

module.exports = new UserService();