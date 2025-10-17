FROM neo4j:5.22

ENV NEO4J_AUTH=neo4j/test1234
ENV NEO4J_apoc_export_file_enabled=true
ENV NEO4J_apoc_import_file_enabled=true
ENV NEO4J_PLUGINS='["apoc"]'

# Copier les données CSV pour l'import
COPY neo4j_data /var/lib/neo4j/import/

# Copier les scripts d'initialisation
COPY init/init.cypher.sh /init/init.cypher.sh
COPY init/startup-wrapper.sh /init/startup-wrapper.sh

# Installer dos2unix, convertir les fins de ligne, et rendre les scripts exécutables
RUN apt-get update && apt-get install -y dos2unix && \
    dos2unix /init/init.cypher.sh /init/startup-wrapper.sh && \
    chmod +x /init/init.cypher.sh /init/startup-wrapper.sh && \
    apt-get remove -y dos2unix && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Utiliser le wrapper comme commande de démarrage
CMD ["/bin/bash", "/init/startup-wrapper.sh"]