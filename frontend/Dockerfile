# Étape 1 : base Node.js
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires à l'installation des dépendances
COPY package*.json ./

# Installer les dépendances (avec cache)
RUN npm install

# Copier le reste du code source
COPY . .

# Exposer le port du serveur de dev
EXPOSE 5173

# Commande de démarrage
CMD ["npm", "run", "dev"]
