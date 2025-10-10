# Film Finder - Base de Données Graphe et Recommandations IA

Film Finder est une application moderne de découverte de films qui utilise une base de données graphe pour analyser les relations entre films, acteurs, réalisateurs et genres, et fournir des recommandations intelligentes basées sur les corrélations.

## 🏗️ Architecture

### Structure des Services

L'application suit une architecture en couches avec séparation claire des responsabilités :

```
┌─────────────────────┐
│    Composants UI    │
├─────────────────────┤
│     Services        │
├─────────────────────┤
│   Repositories      │
├─────────────────────┤
│   Base de Données   │
└─────────────────────┘
```

### Services Principaux

#### 🎬 MovieService
- Gestion des films et recherches
- Recommandations basées sur l'IA
- Statistiques par genre, réalisateur, année
- Calcul de similarités et corrélations

#### 👤 UserService
- Gestion des profils utilisateur
- Favoris, watchlist, historique
- Système de notation et avis
- Analyse des préférences et tendances

#### 🎭 ActorService
- Gestion des acteurs
- Filmographies et collaborations
- Analyse des partenariats

### Repositories

#### Mock Repositories (Développement)
- `MockMovieRepository` - Données films simulées
- `MockUserRepository` - Profils utilisateur mockés
- `MockGraphRepository` - Graphe de relations simulé

#### Future : Repositories Production
- `SupabaseRepository` - Intégration Supabase
- `Neo4jRepository` - Base de données graphe Neo4j

## 🧠 Moteur de Recommandations

### Algorithme de Corrélation

Le système analyse plusieurs dimensions pour calculer des scores de compatibilité :

1. **Genres** (30%) - Chevauchement des genres
2. **Réalisateur** (25%) - Films du même réalisateur
3. **Acteurs** (20%) - Acteurs en commun
4. **Année** (10%) - Proximité temporelle
5. **Note** (15%) - Similarité des évaluations

### Chemins de Recommandation

L'application visualise les chemins logiques qui mènent aux recommandations :
```
Film Favori → Genre Partagé → Réalisateur → Nouveau Film Recommandé
```

## 🗂️ Structure des Dossiers

```
src/
├── services/          # Couche de services métier
│   ├── database.ts    # Interfaces et contrats DB
│   ├── movieService.ts # Service des films
│   ├── userService.ts # Service utilisateur
│   └── serviceFactory.ts # Factory et DI
├── repositories/      # Implémentations d'accès aux données
│   └── mockRepository.ts # Repositories mockées
├── components/        # Composants UI réutilisables
├── pages/            # Pages de l'application
├── utils/            # Utilitaires (legacy)
└── data/             # Données mockées
```

## 🚀 Utilisation

### Initialisation des Services

```typescript
import { initializeServices, defaultConfig } from './services/serviceFactory';

// Initialisation avec données mockées
await initializeServices(defaultConfig);

// Future : Initialisation avec Supabase
await initializeServices({
  type: 'supabase',
  connectionString: 'your-supabase-url',
  apiKey: 'your-api-key'
});
```

### Utilisation dans les Composants

```typescript
import { useMovieService, useUserService } from './services/serviceFactory';

function MovieComponent() {
  const movieService = useMovieService();
  const userService = useUserService();
  
  const recommendations = await movieService.getRecommendationsForUser(
    userFavorites, 
    userHistory, 
    { limit: 10 }
  );
}
```

## 🔧 Configuration Base de Données

### Mode Mock (Développement)
```typescript
const config = { type: 'mock' };
```

### Mode Supabase (Production - À implémenter)
```typescript
const config = {
  type: 'supabase',
  connectionString: process.env.SUPABASE_URL,
  apiKey: process.env.SUPABASE_ANON_KEY
};
```

### Mode Neo4j (Graphe - À implémenter)
```typescript
const config = {
  type: 'neo4j',
  connectionString: process.env.NEO4J_URI,
  username: process.env.NEO4J_USER,
  password: process.env.NEO4J_PASSWORD
};
```

## 📊 Fonctionnalités Graphe

### Exploration Visuelle
- Canvas interactif pour visualiser les relations
- Nœuds colorés par type (films, acteurs, genres, réalisateurs)
- Chemins de recommandation mis en évidence

### Analyse de Corrélations
- Calcul en temps réel des forces de corrélation
- Visualisation des chemins de recommandation
- Scores de compatibilité détaillés

## 🎯 Pages Principales

1. **Graphe** - Exploration visuelle des relations
2. **Recommandations** - IA personnalisée avec analyses détaillées
3. **Recherche** - Interface de recherche et filtrage
4. **Profil** - Favoris, watchlist, statistiques personnelles

## 🔮 Roadmap

### Phase 1 ✅ (Actuel)
- Architecture services/repositories
- Mock repositories fonctionnels
- Interface utilisateur complète
- Moteur de recommandations de base

### Phase 2 🚧 (Prochaine)
- Intégration Supabase
- Authentification utilisateur
- Persistence des données

### Phase 3 🔮 (Future)
- Base de données graphe Neo4j
- Algorithmes ML avancés
- API temps réel
- Recommandations collaboratives

## 🛠️ Technologies

- **Frontend** : React, TypeScript, Tailwind CSS
- **État** : Hooks React natifs
- **Animations** : Motion (ex-Framer Motion)
- **UI** : shadcn/ui components
- **Architecture** : Repository Pattern, Dependency Injection
- **Base de Données** : Mock → Supabase → Neo4j (évolutif)

---

Cette architecture permet une évolution progressive de l'application, de prototypes mockés vers une base de données graphe en production, tout en maintenant une séparation claire des responsabilités.