# Étape 1: Choisir une image de base Node.js légère et sécurisée
FROM node:18-alpine

# Étape 2: Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Étape 3: Copier les fichiers de dépendances
# On copie d'abord package.json pour profiter du cache de Docker.
# L'installation des dépendances ne se relancera que si ce fichier change.
COPY package*.json ./

# Étape 4: Installer les dépendances (y compris nodemon pour le développement)
RUN npm install

# Étape 5: Copier le reste du code source de l'application
COPY . .

# Étape 6: Exposer le port sur lequel l'API s'exécute
EXPOSE 3000

# Étape 7: Commande pour démarrer l'application en mode développement avec nodemon
CMD [ "npm", "run", "dev" ]