# Fichier : Dockerfile

# Utiliser l'image officielle de Neo4j 5.x
FROM neo4j:5.20

# Copier le script Cypher personnalisé dans le dossier d'importation.
# Neo4j exécutera tous les fichiers *.cypher dans ce répertoire au premier démarrage.
COPY init-db.cypher /var/lib/neo4j/import/

# Exposer les ports
EXPOSE 7474 7687

# Le reste de la configuration est géré par docker-compose.yml
