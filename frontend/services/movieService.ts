import { Movie, Actor } from "../data/mockData";
import { Repository, GraphRepository, SearchOptions, QueryOptions, RecommendationOptions, RecommendationResult } from "./database";

/**
 * Interface pour le service des films
 */
export interface MovieService {
  // Opérations de base
  getMovieById(id: string): Promise<Movie | null>;
  getAllMovies(options?: QueryOptions): Promise<Movie[]>;
  searchMovies(options: SearchOptions): Promise<Movie[]>;
  
  // Opérations spécifiques aux films
  getMoviesByGenre(genre: string, options?: QueryOptions): Promise<Movie[]>;
  getMoviesByDirector(director: string, options?: QueryOptions): Promise<Movie[]>;
  getMoviesByActor(actorId: string, options?: QueryOptions): Promise<Movie[]>;
  getMoviesByYear(year: number, options?: QueryOptions): Promise<Movie[]>;
  getMoviesByRatingRange(minRating: number, maxRating: number, options?: QueryOptions): Promise<Movie[]>;
  
  // Recommandations
  getSimilarMovies(movieId: string, options?: RecommendationOptions): Promise<RecommendationResult[]>;
  getRecommendationsForUser(favoriteIds: string[], watchedIds?: string[], options?: RecommendationOptions): Promise<RecommendationResult[]>;
  
  // Statistiques
  getGenreStatistics(): Promise<GenreStatistics[]>;
  getDirectorStatistics(): Promise<DirectorStatistics[]>;
  getYearStatistics(): Promise<YearStatistics[]>;
}

export interface GenreStatistics {
  genre: string;
  movieCount: number;
  averageRating: number;
}

export interface DirectorStatistics {
  director: string;
  movieCount: number;
  averageRating: number;
  totalRevenue?: number;
}

export interface YearStatistics {
  year: number;
  movieCount: number;
  averageRating: number;
  topGenres: string[];
}

/**
 * Interface pour le service des acteurs
 */
export interface ActorService {
  getActorById(id: string): Promise<Actor | null>;
  getAllActors(options?: QueryOptions): Promise<Actor[]>;
  searchActors(options: SearchOptions): Promise<Actor[]>;
  getActorMovies(actorId: string, options?: QueryOptions): Promise<Movie[]>;
  getActorCollaborations(actorId: string, options?: QueryOptions): Promise<ActorCollaboration[]>;
}

export interface ActorCollaboration {
  actor: Actor;
  sharedMovies: Movie[];
  collaborationCount: number;
}

/**
 * Implémentation du service des films
 */
export class MovieServiceImpl implements MovieService {
  constructor(
    private movieRepository: Repository<Movie>,
    private graphRepository: GraphRepository
  ) {}

  async getMovieById(id: string): Promise<Movie | null> {
    return await this.movieRepository.findById(id);
  }

  async getAllMovies(options?: QueryOptions): Promise<Movie[]> {
    return await this.movieRepository.findAll(options);
  }

  async searchMovies(options: SearchOptions): Promise<Movie[]> {
    return await this.movieRepository.search(options);
  }

  async getMoviesByGenre(genre: string, options?: QueryOptions): Promise<Movie[]> {
    return await this.movieRepository.search({
      ...options,
      filters: { genres: genre }
    });
  }

  async getMoviesByDirector(director: string, options?: QueryOptions): Promise<Movie[]> {
    return await this.movieRepository.search({
      ...options,
      filters: { director }
    });
  }

  async getMoviesByActor(actorId: string, options?: QueryOptions): Promise<Movie[]> {
    return await this.movieRepository.search({
      ...options,
      filters: { actorIds: actorId }
    });
  }

  async getMoviesByYear(year: number, options?: QueryOptions): Promise<Movie[]> {
    return await this.movieRepository.search({
      ...options,
      filters: { year }
    });
  }

  async getMoviesByRatingRange(minRating: number, maxRating: number, options?: QueryOptions): Promise<Movie[]> {
    return await this.movieRepository.search({
      ...options,
      filters: { 
        rating: { 
          min: minRating, 
          max: maxRating 
        } 
      }
    });
  }

  async getSimilarMovies(movieId: string, options?: RecommendationOptions): Promise<RecommendationResult[]> {
    return await this.graphRepository.findRecommendations([movieId], options);
  }

  async getRecommendationsForUser(
    favoriteIds: string[], 
    watchedIds?: string[], 
    options?: RecommendationOptions
  ): Promise<RecommendationResult[]> {
    const enhancedOptions = {
      ...options,
      excludeIds: [...(options?.excludeIds || []), ...(watchedIds || [])]
    };
    return await this.graphRepository.findRecommendations(favoriteIds, enhancedOptions);
  }

  async getGenreStatistics(): Promise<GenreStatistics[]> {
    const movies = await this.getAllMovies();
    const genreMap = new Map<string, { count: number; totalRating: number }>();

    movies.forEach(movie => {
      movie.genres.forEach(genre => {
        const current = genreMap.get(genre) || { count: 0, totalRating: 0 };
        genreMap.set(genre, {
          count: current.count + 1,
          totalRating: current.totalRating + movie.rating
        });
      });
    });

    return Array.from(genreMap.entries()).map(([genre, stats]) => ({
      genre,
      movieCount: stats.count,
      averageRating: stats.totalRating / stats.count
    }));
  }

  async getDirectorStatistics(): Promise<DirectorStatistics[]> {
    const movies = await this.getAllMovies();
    const directorMap = new Map<string, { count: number; totalRating: number }>();

    movies.forEach(movie => {
      const current = directorMap.get(movie.director) || { count: 0, totalRating: 0 };
      directorMap.set(movie.director, {
        count: current.count + 1,
        totalRating: current.totalRating + movie.rating
      });
    });

    return Array.from(directorMap.entries()).map(([director, stats]) => ({
      director,
      movieCount: stats.count,
      averageRating: stats.totalRating / stats.count
    }));
  }

  async getYearStatistics(): Promise<YearStatistics[]> {
    const movies = await this.getAllMovies();
    const yearMap = new Map<number, { count: number; totalRating: number; genres: Map<string, number> }>();

    movies.forEach(movie => {
      const current = yearMap.get(movie.year) || { 
        count: 0, 
        totalRating: 0, 
        genres: new Map() 
      };
      
      movie.genres.forEach(genre => {
        current.genres.set(genre, (current.genres.get(genre) || 0) + 1);
      });
      
      yearMap.set(movie.year, {
        count: current.count + 1,
        totalRating: current.totalRating + movie.rating,
        genres: current.genres
      });
    });

    return Array.from(yearMap.entries()).map(([year, stats]) => ({
      year,
      movieCount: stats.count,
      averageRating: stats.totalRating / stats.count,
      topGenres: Array.from(stats.genres.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre)
    }));
  }
}

/**
 * Implémentation du service des acteurs
 */
export class ActorServiceImpl implements ActorService {
  constructor(
    private actorRepository: Repository<Actor>,
    private movieService: MovieService
  ) {}

  async getActorById(id: string): Promise<Actor | null> {
    return await this.actorRepository.findById(id);
  }

  async getAllActors(options?: QueryOptions): Promise<Actor[]> {
    return await this.actorRepository.findAll(options);
  }

  async searchActors(options: SearchOptions): Promise<Actor[]> {
    return await this.actorRepository.search(options);
  }

  async getActorMovies(actorId: string, options?: QueryOptions): Promise<Movie[]> {
    return await this.movieService.getMoviesByActor(actorId, options);
  }

  async getActorCollaborations(actorId: string, options?: QueryOptions): Promise<ActorCollaboration[]> {
    const actorMovies = await this.getActorMovies(actorId);
    const collaboratorMap = new Map<string, { actor: Actor; movies: Movie[] }>();

    for (const movie of actorMovies) {
      for (const actor of movie.actors) {
        if (actor.id !== actorId) {
          const current = collaboratorMap.get(actor.id) || { actor, movies: [] };
          current.movies.push(movie);
          collaboratorMap.set(actor.id, current);
        }
      }
    }

    return Array.from(collaboratorMap.values())
      .map(({ actor, movies }) => ({
        actor,
        sharedMovies: movies,
        collaborationCount: movies.length
      }))
      .sort((a, b) => b.collaborationCount - a.collaborationCount)
      .slice(0, options?.limit || 10);
  }
}