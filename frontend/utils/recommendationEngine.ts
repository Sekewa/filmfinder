import { Movie, mockMovies } from "../data/mockData";

export interface RecommendationScore {
  movieId: string;
  score: number;
  reasons: RecommendationReason[];
  correlationPath: CorrelationNode[];
}

export interface RecommendationReason {
  type: 'genre' | 'director' | 'actor' | 'year' | 'rating' | 'collaborative';
  weight: number;
  description: string;
  relatedMovies?: string[];
}

export interface CorrelationNode {
  id: string;
  type: 'movie' | 'genre' | 'director' | 'actor';
  label: string;
  weight: number;
}

export class RecommendationEngine {
  private movies: Movie[] = mockMovies;
  
  // Poids pour chaque type de corrélation
  private weights = {
    genre: 0.3,
    director: 0.25,
    actor: 0.2,
    year: 0.1,
    rating: 0.15
  };

  /**
   * Génère des recommandations basées sur les films aimés par l'utilisateur
   */
  generateRecommendations(
    favoriteMovieIds: string[], 
    watchedMovieIds: string[] = [],
    limit: number = 10
  ): RecommendationScore[] {
    const favoriteMovies = this.movies.filter(m => favoriteMovieIds.includes(m.id));
    const unwatchedMovies = this.movies.filter(m => 
      !favoriteMovieIds.includes(m.id) && 
      !watchedMovieIds.includes(m.id)
    );

    const recommendations: RecommendationScore[] = [];

    unwatchedMovies.forEach(movie => {
      const score = this.calculateMovieScore(movie, favoriteMovies);
      if (score.score > 0) {
        recommendations.push(score);
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Calcule le score de recommandation pour un film
   */
  private calculateMovieScore(movie: Movie, favoriteMovies: Movie[]): RecommendationScore {
    let totalScore = 0;
    const reasons: RecommendationReason[] = [];
    const correlationPath: CorrelationNode[] = [];

    favoriteMovies.forEach(favoriteMovie => {
      // Corrélation par genre
      const genreOverlap = this.calculateGenreCorrelation(movie, favoriteMovie);
      if (genreOverlap.score > 0) {
        totalScore += genreOverlap.score * this.weights.genre;
        reasons.push({
          type: 'genre',
          weight: genreOverlap.score * this.weights.genre,
          description: `Partage ${genreOverlap.sharedGenres.length} genre(s) avec "${favoriteMovie.title}"`,
          relatedMovies: [favoriteMovie.id]
        });
        
        // Ajouter les genres partagés au chemin de corrélation
        genreOverlap.sharedGenres.forEach(genre => {
          correlationPath.push({
            id: `genre-${genre}`,
            type: 'genre',
            label: genre,
            weight: genreOverlap.score
          });
        });
      }

      // Corrélation par réalisateur
      if (movie.director === favoriteMovie.director) {
        const directorScore = 1.0 * this.weights.director;
        totalScore += directorScore;
        reasons.push({
          type: 'director',
          weight: directorScore,
          description: `Même réalisateur que "${favoriteMovie.title}" (${movie.director})`,
          relatedMovies: [favoriteMovie.id]
        });
        
        correlationPath.push({
          id: `director-${movie.director}`,
          type: 'director',
          label: movie.director,
          weight: 1.0
        });
      }

      // Corrélation par acteur
      const actorOverlap = this.calculateActorCorrelation(movie, favoriteMovie);
      if (actorOverlap.score > 0) {
        totalScore += actorOverlap.score * this.weights.actor;
        reasons.push({
          type: 'actor',
          weight: actorOverlap.score * this.weights.actor,
          description: `Partage ${actorOverlap.sharedActors.length} acteur(s) avec "${favoriteMovie.title}"`,
          relatedMovies: [favoriteMovie.id]
        });
        
        actorOverlap.sharedActors.forEach(actor => {
          correlationPath.push({
            id: `actor-${actor.id}`,
            type: 'actor',
            label: actor.name,
            weight: actorOverlap.score
          });
        });
      }

      // Corrélation par année (proximité temporelle)
      const yearScore = this.calculateYearCorrelation(movie, favoriteMovie);
      if (yearScore > 0) {
        totalScore += yearScore * this.weights.year;
        reasons.push({
          type: 'year',
          weight: yearScore * this.weights.year,
          description: `Proche temporellement de "${favoriteMovie.title}" (${Math.abs(movie.year - favoriteMovie.year)} ans d'écart)`,
          relatedMovies: [favoriteMovie.id]
        });
      }

      // Corrélation par note (goûts similaires)
      const ratingScore = this.calculateRatingCorrelation(movie, favoriteMovie);
      if (ratingScore > 0) {
        totalScore += ratingScore * this.weights.rating;
        reasons.push({
          type: 'rating',
          weight: ratingScore * this.weights.rating,
          description: `Note similaire à "${favoriteMovie.title}" (${movie.rating} vs ${favoriteMovie.rating})`,
          relatedMovies: [favoriteMovie.id]
        });
      }
    });

    // Ajouter le film cible au chemin de corrélation
    correlationPath.push({
      id: `movie-${movie.id}`,
      type: 'movie',
      label: movie.title,
      weight: totalScore
    });

    return {
      movieId: movie.id,
      score: Math.min(totalScore, 1.0), // Normaliser entre 0 et 1
      reasons: reasons.sort((a, b) => b.weight - a.weight),
      correlationPath: this.optimizeCorrelationPath(correlationPath)
    };
  }

  /**
   * Calcule la corrélation par genre
   */
  private calculateGenreCorrelation(movie1: Movie, movie2: Movie) {
    const sharedGenres = movie1.genres.filter(g => movie2.genres.includes(g));
    const totalGenres = new Set([...movie1.genres, ...movie2.genres]).size;
    
    return {
      score: sharedGenres.length / totalGenres,
      sharedGenres
    };
  }

  /**
   * Calcule la corrélation par acteur
   */
  private calculateActorCorrelation(movie1: Movie, movie2: Movie) {
    const sharedActors = movie1.actors.filter(a1 => 
      movie2.actors.some(a2 => a2.id === a1.id)
    );
    const totalActors = new Set([
      ...movie1.actors.map(a => a.id), 
      ...movie2.actors.map(a => a.id)
    ]).size;
    
    return {
      score: sharedActors.length / totalActors,
      sharedActors
    };
  }

  /**
   * Calcule la corrélation par année
   */
  private calculateYearCorrelation(movie1: Movie, movie2: Movie): number {
    const yearDiff = Math.abs(movie1.year - movie2.year);
    // Plus l'écart est faible, plus le score est élevé (max 5 ans)
    return Math.max(0, 1 - yearDiff / 10);
  }

  /**
   * Calcule la corrélation par note
   */
  private calculateRatingCorrelation(movie1: Movie, movie2: Movie): number {
    const ratingDiff = Math.abs(movie1.rating - movie2.rating);
    // Plus l'écart de note est faible, plus le score est élevé
    return Math.max(0, 1 - ratingDiff / 2);
  }

  /**
   * Optimise le chemin de corrélation en supprimant les doublons
   */
  private optimizeCorrelationPath(path: CorrelationNode[]): CorrelationNode[] {
    const uniqueNodes = new Map<string, CorrelationNode>();
    
    path.forEach(node => {
      const existing = uniqueNodes.get(node.id);
      if (!existing || node.weight > existing.weight) {
        uniqueNodes.set(node.id, node);
      }
    });
    
    return Array.from(uniqueNodes.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6); // Limiter à 6 nœuds pour la lisibilité
  }

  /**
   * Génère des recommandations basées sur un film spécifique
   */
  generateSimilarMovies(movieId: string, limit: number = 5): RecommendationScore[] {
    const movie = this.movies.find(m => m.id === movieId);
    if (!movie) return [];

    return this.generateRecommendations([movieId], [], limit);
  }

  /**
   * Analyse les tendances dans les préférences utilisateur
   */
  analyzeTrends(favoriteMovieIds: string[]) {
    const favoriteMovies = this.movies.filter(m => favoriteMovieIds.includes(m.id));
    
    // Analyser les genres préférés
    const genreCount = new Map<string, number>();
    favoriteMovies.forEach(movie => {
      movie.genres.forEach(genre => {
        genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
      });
    });

    // Analyser les réalisateurs préférés
    const directorCount = new Map<string, number>();
    favoriteMovies.forEach(movie => {
      directorCount.set(movie.director, (directorCount.get(movie.director) || 0) + 1);
    });

    // Analyser les décennies préférées
    const decadeCount = new Map<string, number>();
    favoriteMovies.forEach(movie => {
      const decade = Math.floor(movie.year / 10) * 10;
      decadeCount.set(`${decade}s`, (decadeCount.get(`${decade}s`) || 0) + 1);
    });

    return {
      favoriteGenres: Array.from(genreCount.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      favoriteDirectors: Array.from(directorCount.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3),
      favoriteDecades: Array.from(decadeCount.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3),
      averageRating: favoriteMovies.reduce((sum, m) => sum + m.rating, 0) / favoriteMovies.length
    };
  }
}