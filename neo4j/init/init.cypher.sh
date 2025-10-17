#!/bin/bash
set -e

# --- Configuration et Variables ---
# Utilise 'localhost' car ce script s'exécute dans le conteneur Neo4j
NEO4J_HOST="localhost"
NEO4J_PORT="7687"
NEO4J_USER="neo4j"
# Récupère le mot de passe depuis la variable d'environnement NEO4J_AUTH
NEO4J_PASS="${NEO4J_AUTH##*/}"
IMPORT_DIR="/data"
MOVIES_FILE="TMDB_movie_dataset_v11.csv" # Mettez ici le nom exact de votre fichier CSV

# --- 1. Attente du Démarrage de Neo4j ---
echo "Attente de la connexion à Neo4j sur $NEO4J_HOST:$NEO4J_PORT..."
# Utilise cypher-shell pour vérifier la connexion
cypher-shell -u $NEO4J_USER -p $NEO4J_PASS "RETURN 1" > /dev/null 2>&1
while [ $? -ne 0 ]; do
    sleep 1
    cypher-shell -u $NEO4J_USER -p $NEO4J_PASS "RETURN 1" > /dev/null 2>&1
done
echo "Neo4j est prêt. Démarrage de l'initialisation."

# --- 2. Création des Contraintes et Index (Crucial pour la performance) ---
echo "Création des contraintes d'unicité..."

# Requêtes de contrainte pour les entités
CONSTRAINTS=$(cat <<EOF
CREATE CONSTRAINT MovieIdUnique IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE;
CREATE CONSTRAINT GenreNameUnique IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE;
CREATE CONSTRAINT KeywordNameUnique IF NOT EXISTS FOR (k:Keyword) REQUIRE k.name IS UNIQUE;
CREATE CONSTRAINT CompanyNameUnique IF NOT EXISTS FOR (c:Company) REQUIRE c.name IS UNIQUE;
CREATE CONSTRAINT CountryNameUnique IF NOT EXISTS FOR (co:Country) REQUIRE co.name IS UNIQUE;
CREATE CONSTRAINT LanguageNameUnique IF NOT EXISTS FOR (l:Language) REQUIRE l.name IS UNIQUE;
CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE;
CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
EOF
)
cypher-shell -u $NEO4J_USER -p $NEO4J_PASS "$CONSTRAINTS"

# --- 3. Requête d'Importation (LOAD CSV) ---
echo "Démarrage de l'importation du fichier $IMPORT_DIR/$MOVIES_FILE et création des relations..."

CYPHER_QUERY=$(cat <<EOF
LOAD CSV WITH HEADERS FROM 'file:///$MOVIES_FILE' AS row
WITH row WHERE row.id IS NOT NULL 

CALL {
    WITH row
    
    MERGE (m:Movie {id: toInteger(row.id)})
    ON CREATE SET
        m.title = row.title,
        m.release_date = row.release_date,  
        m.vote_average = toFloat(row.vote_average),
        m.vote_count = toInteger(row.vote_count),
        m.status = row.status,
        m.revenue = toInteger(row.revenue),
        m.runtime = toInteger(row.runtime),
        m.adult = toBoolean(row.adult),
        m.budget = toInteger(row.budget),
        m.homepage = row.homepage,
        m.imdb_id = row.imdb_id,
        m.original_language = row.original_language,
        m.original_title = row.original_title,
        //m.overview = row.overview,
        m.popularity = toFloat(row.popularity),
        m.poster_path = row.poster_path,
        m.backdrop_path = row.backdrop_path,
        m.tagline = row.tagline
    

    FOREACH (genreName IN split(row.genres, ',') |
        MERGE (g:Genre {name: trim(genreName)})
        CREATE (m)-[:HAS_GENRE]->(g)
    )

    FOREACH (keywordName IN split(row.keywords, ',') |
        MERGE (k:Keyword {name: trim(keywordName)})
        CREATE (m)-[:TAGGED_WITH]->(k)
    )

    FOREACH (companyName IN split(row.production_companies, ',') |
        MERGE (c:Company {name: trim(companyName)})
        CREATE (m)-[:PRODUCED_BY]->(c)
    )

    FOREACH (countryName IN split(row.production_countries, ',') |
        MERGE (co:Country {name: trim(countryName)})
        CREATE (m)-[:RELEASED_IN]->(co)
    )

    FOREACH (languageName IN split(row.spoken_languages, ',') |
        MERGE (l:Language {name: trim(languageName)})
        CREATE (m)-[:SPOKEN_IN]->(l)
    )

} IN TRANSACTIONS OF 5000 ROWS;
EOF
)

# Exécuter la requête d'importation
cypher-shell -u $NEO4J_USER -p $NEO4J_PASS "$CYPHER_QUERY"

echo "Importation de $MOVIES_FILE terminée avec succès!"