// Fichier : init-db.cypher
// Ce script est exécuté automatiquement par Neo4j au premier démarrage du conteneur.

// --- 1. Création des contraintes d'unicité (essentiel pour MERGE) ---
// Ces contraintes garantissent que chaque entité est unique, basée sur son ID.
CREATE CONSTRAINT IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (a:Actor) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (g:Genre) REQUIRE g.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (d:Director) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (k:Keyword) REQUIRE k.id IS UNIQUE;

// --- 2. Exemple d'insertion de données de test (Inception) ---
// Note : Le script Node.js utilisera ces nœuds pour MERGE (mettre à jour/créer)
MERGE (f:Movie {id: '27205', title: 'Inception', release_date: '2010-07-16', tagline: 'The dream is real.'})
// Acteur principal
MERGE (c:Actor {id: '287', name: 'Leonardo DiCaprio'})
// Réalisateur
MERGE (d:Director {id: '525', name: 'Christopher Nolan'})
// Genre
MERGE (g:Genre {id: '28', name: 'Action'})

// --- 3. Création des relations de test ---
MERGE (c)-[:ACTED_IN {character: 'Cobb'}]->(f);
MERGE (d)-[:DIRECTED]->(f);
MERGE (f)-[:HAS_GENRE]->(g);

// Renvoie un message de confirmation
RETURN 'Initialisation de la base de données avec les contraintes et les données de test terminée.' AS status;
