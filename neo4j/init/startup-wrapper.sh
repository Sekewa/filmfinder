#!/bin/bash
set -e

echo "🚀 Starting Neo4j with auto-initialization..."

# Lance Neo4j en arrière-plan
echo "📦 Starting Neo4j server..."
/startup/docker-entrypoint.sh neo4j &
NEO4J_PID=$!

# Attendre que Neo4j soit prêt
echo "⏳ Waiting for Neo4j to be ready (this may take 30-60 seconds)..."
sleep 30

# Vérifier si Neo4j répond
echo "🔍 Checking Neo4j connection..."
for i in {1..30}; do
    if cypher-shell -u neo4j -p "${NEO4J_AUTH##*/}" "RETURN 1" > /dev/null 2>&1; then
        echo "✅ Neo4j is ready!"
        break
    fi
    echo "   Attempt $i/30 - waiting..."
    sleep 2
done

# Vérifier si l'initialisation a déjà été faite
echo "🔍 Checking if database is already initialized..."
MOVIE_COUNT=$(cypher-shell -u neo4j -p "${NEO4J_AUTH##*/}" "MATCH (m:Movie) RETURN count(m) as count" --format plain 2>/dev/null | tail -n 1 | tr -d '"' || echo "0")

if [ "$MOVIE_COUNT" = "0" ] || [ -z "$MOVIE_COUNT" ]; then
    echo "📝 Database is empty. Running initialization script..."
    if bash /init/init.cypher.sh; then
        echo "✅ Initialization completed successfully!"
    else
        echo "⚠️  Initialization script failed, but Neo4j will continue running."
        echo "    You can run the script manually with: docker exec neo4j bash /init/init.cypher.sh"
    fi
else
    echo "✅ Database already initialized with $MOVIE_COUNT movies. Skipping initialization."
fi

echo "🎬 Neo4j is ready and running!"

# Garder Neo4j en avant-plan
wait $NEO4J_PID
