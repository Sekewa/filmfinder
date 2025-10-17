// src/services/recommendationService.js
const neo4j = require('neo4j-driver');
const { getSession } = require('../db');
const userService = require('./userService');

class RecommendationService {

    /**
     * Recommandations basées sur des films similaires avec scoring multicritère.
     */
    async getRelatedTo(filmId, userId) {
        const session = getSession();
        const user = await userService.getAuthenticatedUser(userId);
        const history = user ? user.history : [];

        try {
            const result = await session.run(`
                MATCH (source:Movie {id: $filmId}) WHERE source.adult = false
                MATCH (rec:Movie)
                WHERE rec.id <> source.id AND NOT rec.id IN $history AND rec.adult = false AND rec.vote_count > 10
                WITH source, rec,
                    size([(rec)-[:HAS_GENRE]->(g:Genre)<-[:HAS_GENRE]-(source) | g]) * 1.0 /
                    size([(source)-[:HAS_GENRE]->(g:Genre) | g]) as genreScore,
                    size([(rec)-[:PRODUCED_BY]->(c:Company)<-[:PRODUCED_BY]-(source) | c]) as companyMatch,
                    CASE
                        WHEN source.vote_average > 0 AND rec.vote_average > 0
                        THEN 1.0 - (abs(source.vote_average - rec.vote_average) / 10.0)
                        ELSE 0.5
                    END as ratingScore,
                    CASE
                        WHEN source.release_date IS NOT NULL AND rec.release_date IS NOT NULL
                        THEN 1.0 - (abs(toInteger(substring(source.release_date, 0, 4)) -
                                    toInteger(substring(rec.release_date, 0, 4))) / 50.0)
                        ELSE 0.5
                    END as yearScore
                WITH source, rec,
                    (genreScore * 0.40 +
                        CASE WHEN companyMatch > 0 THEN 0.25 ELSE 0 END +
                        ratingScore * 0.20 +
                        yearScore * 0.15) as similarityScore,
                    genreScore, companyMatch
                WHERE similarityScore > 0.3
                WITH rec, similarityScore,
                    CASE
                        WHEN genreScore > 0.5 AND companyMatch > 0 THEN "Même genre et société de production"
                        WHEN genreScore > 0.5 THEN "Genres similaires"
                        WHEN companyMatch > 0 THEN "Même société de production"
                        ELSE "Film similaire"
                    END as reason
                RETURN rec, reason, similarityScore
                ORDER BY similarityScore DESC, rec.popularity DESC
                LIMIT 10
            `, { filmId, history });

            return result.records.map(record => ({
                ...record.get('rec').properties,
                reason: record.get('reason'),
                score: record.get('similarityScore')
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
        const user = await userService.getAuthenticatedUser(userId);
        const history = user ? user.history : [];

        try {
            const result = await session.run(`
                MATCH (m:Movie)
                WHERE m.vote_average > 8.0
                    AND m.vote_count < 1000
                    AND NOT m.id IN $history
                    AND m.adult = false
                OPTIONAL MATCH (m)-[:HAS_GENRE]->(g:Genre)
                WITH m,
                    m.vote_average as rating,
                    m.vote_count as voteCount,
                    m.popularity as popularity,
                    COLLECT(DISTINCT g.name) as genres
                RETURN m, rating, voteCount, popularity, genres
                ORDER BY rating DESC
                LIMIT 5
            `, { history });

            return result.records.map(record => ({
                ...record.get('m').properties,
                score: record.get('rating') / 10,
                analysis: {
                    type: 'hidden_gem',
                    metrics: {
                        rating: record.get('rating'),
                        voteCount: typeof record.get('voteCount') === 'object' ? record.get('voteCount').low : record.get('voteCount'),
                        popularity: record.get('popularity')
                    },
                    genres: record.get('genres'),
                    reason: `Trésor caché avec une note exceptionnelle de ${record.get('rating').toFixed(1)}/10 mais seulement ${typeof record.get('voteCount') === 'object' ? record.get('voteCount').low : record.get('voteCount')} votes. Film sous-estimé à découvrir !`
                }
            }));
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
        const user = await userService.getAuthenticatedUser(userId);
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
     * Recommandations basées sur la société de production.
     */
    async getByProductionCompany(filmId, userId) {
        const session = getSession();
        const user = await userService.getAuthenticatedUser(userId);
        const history = user ? user.history : [];

        try {
            const result = await session.run(`
                MATCH (source:Movie {id: $filmId})-[:PRODUCED_BY]->(company:Company)
                WHERE source.adult = false
                MATCH (rec:Movie)-[:PRODUCED_BY]->(company)
                WHERE rec.id <> source.id
                    AND NOT rec.id IN $history
                    AND rec.adult = false
                    AND rec.vote_count > 50
                WITH rec, COLLECT(DISTINCT company.name)[0..2] as companies,
                    rec.vote_average * (log(rec.vote_count) / 10.0) as qualityScore
                RETURN rec, companies[0] as mainCompany
                ORDER BY qualityScore DESC
                LIMIT 10
            `, { filmId, history });

            return result.records.map(record => ({
                ...record.get('rec').properties,
                reason: `Produit par ${record.get('mainCompany')}`
            }));
        } catch (error) {
            console.error("Erreur dans recommendationService.getByProductionCompany:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Recommandations basées sur vos favoris et films aimés
     */
    async getPersonalizedRecommendations(userId, limit = 5) {
        const session = getSession();
        const user = await userService.getAuthenticatedUser(userId);

        if (!user) {
            return [];
        }

        const favorites = user.favorites || [];
        const history = user.history || [];
        const allWatched = [...new Set([...favorites, ...history])];

        if (allWatched.length === 0) {
            return this.getTrending(userId, limit);
        }

        try {
            const result = await session.run(`
                MATCH (liked:Movie)
                WHERE liked.id IN $favorites AND liked.adult = false
                OPTIONAL MATCH (liked)-[:HAS_GENRE]->(g:Genre)
                WITH COLLECT(DISTINCT g.name) as favoriteGenres, COLLECT(DISTINCT liked) as likedMovies
                UNWIND likedMovies as liked
                OPTIONAL MATCH (liked)-[:PRODUCED_BY]->(c:Company)
                WITH favoriteGenres, likedMovies, COLLECT(DISTINCT c) as favoriteCompanies
                MATCH (rec:Movie)
                WHERE rec.adult = false
                    AND NOT rec.id IN $allWatched
                    AND rec.vote_count > 50
                    AND rec.vote_average >= 7.0
                OPTIONAL MATCH (rec)-[:HAS_GENRE]->(recGenre:Genre)
                WHERE recGenre.name IN favoriteGenres
                WITH rec, favoriteGenres, favoriteCompanies,
                    COLLECT(DISTINCT recGenre.name) as sharedGenres,
                    COUNT(DISTINCT recGenre) as genreMatches
                OPTIONAL MATCH (rec)-[:PRODUCED_BY]->(recCompany:Company)
                WHERE recCompany IN favoriteCompanies
                WITH rec, favoriteGenres, sharedGenres, genreMatches,
                    COUNT(DISTINCT recCompany) as companyMatches,
                    rec.vote_average as rating,
                    rec.vote_count as voteCount
                WITH rec, sharedGenres, favoriteGenres, rating, voteCount,
                    (genreMatches * 0.6 + companyMatches * 0.3 + (rating / 10.0) * 0.1) as matchScore
                WHERE matchScore > 0.3
                RETURN rec, matchScore, sharedGenres, favoriteGenres, rating, voteCount
                ORDER BY matchScore DESC, rating DESC
                LIMIT $limit
            `, {
                favorites: favorites.map(id => typeof id === 'object' ? id : neo4j.int(id)),
                allWatched: allWatched.map(id => typeof id === 'object' ? id : neo4j.int(id)),
                limit: neo4j.int(limit)
            });

            return result.records.map(record => ({
                ...record.get('rec').properties,
                score: record.get('matchScore'),
                analysis: {
                    type: 'personalized',
                    metrics: {
                        matchScore: record.get('matchScore'),
                        rating: record.get('rating'),
                        voteCount: typeof record.get('voteCount') === 'object' ? record.get('voteCount').low : record.get('voteCount')
                    },
                    sharedGenres: record.get('sharedGenres'),
                    favoriteGenres: record.get('favoriteGenres'),
                    reason: `Recommandé car partage ${record.get('sharedGenres').length} genre(s) avec vos films favoris (${record.get('sharedGenres').join(', ')}). Note: ${record.get('rating').toFixed(1)}/10`
                }
            }));
        } catch (error) {
            console.error("Erreur dans recommendationService.getPersonalizedRecommendations:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Films tendance actuellement (version simplifiée)
     */
    async getTrending(userId, limit = 5) {
        const session = getSession();
        const user = await userService.getAuthenticatedUser(userId);
        const history = user ? [...(user.favorites || []), ...(user.history || [])] : [];

        try {
            const result = await session.run(`
                MATCH (m:Movie)
                WHERE m.adult = false
                    AND NOT m.id IN $history
                    AND m.vote_count > 500
                    AND m.vote_average >= 7.0
                OPTIONAL MATCH (m)-[:HAS_GENRE]->(g:Genre)
                WITH m,
                    m.popularity as popularity,
                    m.vote_average as rating,
                    m.vote_count as voteCount,
                    COLLECT(DISTINCT g.name) as genres
                RETURN m, popularity, rating, voteCount, genres
                ORDER BY popularity DESC, rating DESC
                LIMIT $limit
            `, { history: history.map(id => typeof id === 'object' ? id : neo4j.int(id)), limit: neo4j.int(limit) });

            return result.records.map(record => ({
                ...record.get('m').properties,
                score: record.get('rating') / 10,
                analysis: {
                    type: 'trending',
                    metrics: {
                        popularity: record.get('popularity'),
                        rating: record.get('rating'),
                        voteCount: typeof record.get('voteCount') === 'object' ? record.get('voteCount').low : record.get('voteCount')
                    },
                    genres: record.get('genres'),
                    reason: `Film populaire avec une excellente note de ${record.get('rating').toFixed(1)}/10 basée sur ${typeof record.get('voteCount') === 'object' ? record.get('voteCount').low : record.get('voteCount')} votes`
                }
            }));
        } catch (error) {
            console.error("Erreur dans recommendationService.getTrending:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Classiques par décennie.
     */
    async getDecadeClassics(decade, userId, limit = 15) {
        const session = getSession();
        const user = await userService.getAuthenticatedUser(userId);
        const history = user ? user.history : [];

        try {
            const startYear = parseInt(decade);
            const endYear = startYear + 9;

            const result = await session.run(`
                MATCH (m:Movie)
                WHERE m.adult = false
                    AND NOT m.id IN $history
                    AND m.release_date IS NOT NULL
                    AND toInteger(substring(m.release_date, 0, 4)) >= $startYear
                    AND toInteger(substring(m.release_date, 0, 4)) <= $endYear
                    AND m.vote_count > 200
                WITH m,
                    m.vote_average * log(m.vote_count) as classicScore
                WHERE m.vote_average >= 7.0
                RETURN m
                ORDER BY classicScore DESC
                LIMIT $limit
            `, { history, startYear, endYear, limit: neo4j.int(limit) });

            return result.records.map(r => r.get('m').properties);
        } catch (error) {
            console.error("Erreur dans recommendationService.getDecadeClassics:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Découverte de nouveaux genres basée sur l'historique.
     */
    async getGenreDiscovery(userId, limit = 5) {
        const session = getSession();
        const user = await userService.getAuthenticatedUser(userId);
        const history = user ? user.history : [];

        if (history.length === 0) {
            return this.getTrending(userId, limit);
        }

        try {
            const result = await session.run(`
                MATCH (watched:Movie)-[:HAS_GENRE]->(seenGenre:Genre)
                WHERE watched.id IN $history
                WITH COLLECT(DISTINCT seenGenre.name) as seenGenres
                MATCH (m:Movie)-[:HAS_GENRE]->(g:Genre)
                WHERE m.adult = false
                    AND NOT m.id IN $history
                    AND NOT g.name IN seenGenres
                    AND m.vote_average >= 7.0
                    AND m.vote_count > 100
                WITH m,
                    COLLECT(DISTINCT g.name) as newGenres,
                    m.vote_average as rating,
                    m.vote_count as voteCount,
                    m.vote_average * log(m.vote_count) as discoveryScore,
                    seenGenres
                RETURN m, newGenres, rating, voteCount, discoveryScore, seenGenres
                ORDER BY discoveryScore DESC
                LIMIT $limit
            `, { history, limit: neo4j.int(limit) });

            return result.records.map(record => ({
                ...record.get('m').properties,
                score: record.get('discoveryScore') / 100,
                analysis: {
                    type: 'genre_discovery',
                    metrics: {
                        rating: record.get('rating'),
                        voteCount: typeof record.get('voteCount') === 'object' ? record.get('voteCount').low : record.get('voteCount'),
                        discoveryScore: record.get('discoveryScore')
                    },
                    newGenres: record.get('newGenres'),
                    seenGenres: record.get('seenGenres'),
                    reason: `Découverte de nouveaux genres (${record.get('newGenres').join(', ')}) différents de vos préférences habituelles (${record.get('seenGenres').slice(0, 3).join(', ')}). Film de qualité pour élargir vos horizons !`
                }
            }));
        } catch (error) {
            console.error("Erreur dans recommendationService.getGenreDiscovery:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Recommandations "Prochain réalisateur à suivre".
     */
    async getNextDirectorToWatch(userId) {
        const session = getSession();
        const user = await userService.getAuthenticatedUser(userId);
        if (!user || !user.history || user.history.length === 0) return [];
        
        console.warn("La recommandation par réalisateur suppose une relation (p:Person)-[:DIRECTED]->(m:Movie) qui n'est pas dans le script d'import initial.");
        return Promise.resolve([]);
    }
}

module.exports = new RecommendationService();