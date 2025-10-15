FROM neo4j:5.22

ENV NEO4J_AUTH=neo4j/test1234
ENV NEO4J_apoc_export_file_enabled=true
ENV NEO4J_apoc_import_file_enabled=true
ENV NEO4J_PLUGINS='["apoc"]'

COPY init/init.cypher.sh /docker-entrypoint-initdb.d/
COPY neo4j_data /var/lib/neo4j/import/

RUN chmod +x /docker-entrypoint-initdb.d/init.cypher.sh