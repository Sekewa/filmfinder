import { 
  Repository, 
  GraphRepository, 
  QueryOptions, 
  SearchOptions, 
  GraphNode, 
  GraphEdge, 
  GraphPath,
  RecommendationOptions,
  RecommendationResult,
  RecommendationReason
} from "../services/database";
import { Movie, Actor, mockMovies } from "../data/mockData";
import { UserData, UserActivity, convertMockUserData } from "../services/userService";

/**
 * Repository mockée pour les films
 */
export class MockMovieRepository implements Repository<Movie> {
  private movies: Movie[] = mockMovies;

  async findById(id: string): Promise<Movie | null> {
    return this.movies.find(movie => movie.id === id) || null;
  }

  async findAll(options?: QueryOptions): Promise<Movie[]> {
    let result = [...this.movies];

    // Tri
    if (options?.orderBy) {
      const direction = options.orderDirection === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        const aValue = (a as any)[options.orderBy!];
        const bValue = (b as any)[options.orderBy!];
        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
      });
    }

    // Pagination
    if (options?.offset) {
      result = result.slice(options.offset);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  async search(options: SearchOptions): Promise<Movie[]> {
    let result = [...this.movies];

    // Filtrage par query text
    if (options.query) {
      const query = options.query.toLowerCase();
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query) ||
        movie.director.toLowerCase().includes(query) ||
        movie.genres.some(genre => genre.toLowerCase().includes(query)) ||
        movie.actors.some(actor => actor.name.toLowerCase().includes(query))
      );
    }

    // Filtrage par filtres spécifiques
    if (options.filters) {
      if (options.filters.genres) {
        result = result.filter(movie => 
          movie.genres.includes(options.filters!.genres)
        );
      }
      
      if (options.filters.director) {
        result = result.filter(movie => 
          movie.director === options.filters!.director
        );
      }
      
      if (options.filters.year) {
        result = result.filter(movie => 
          movie.year === options.filters!.year
        );
      }
      
      if (options.filters.rating) {
        const { min, max } = options.filters.rating;
        result = result.filter(movie => 
          movie.rating >= min && movie.rating <= max
        );
      }
      
      if (options.filters.actorIds) {
        result = result.filter(movie => 
          movie.actors.some(actor => actor.id === options.filters!.actorIds)
        );
      }
    }

    return this.findAll({ ...options, query: undefined, filters: undefined });
  }

  async create(entity: Omit<Movie, 'id'>): Promise<Movie> {
    const newMovie: Movie = {
      ...entity,
      id: `movie_${Date.now()}`
    };
    this.movies.push(newMovie);
    return newMovie;
  }

  async update(id: string, entity: Partial<Movie>): Promise<Movie | null> {
    const index = this.movies.findIndex(movie => movie.id === id);
    if (index === -1) return null;

    this.movies[index] = { ...this.movies[index], ...entity };
    return this.movies[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.movies.findIndex(movie => movie.id === id);
    if (index === -1) return false;

    this.movies.splice(index, 1);
    return true;
  }
}

/**
 * Repository mockée pour les acteurs
 */
export class MockActorRepository implements Repository<Actor> {
  private actors: Actor[] = [];

  constructor() {
    // Extraire tous les acteurs des films
    const actorMap = new Map<string, Actor>();
    mockMovies.forEach(movie => {
      movie.actors.forEach(actor => {
        actorMap.set(actor.id, actor);
      });
    });
    this.actors = Array.from(actorMap.values());
  }

  async findById(id: string): Promise<Actor | null> {
    return this.actors.find(actor => actor.id === id) || null;
  }

  async findAll(options?: QueryOptions): Promise<Actor[]> {
    let result = [...this.actors];

    if (options?.orderBy) {
      const direction = options.orderDirection === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        const aValue = (a as any)[options.orderBy!];
        const bValue = (b as any)[options.orderBy!];
        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
      });
    }

    if (options?.offset) {
      result = result.slice(options.offset);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  async search(options: SearchOptions): Promise<Actor[]> {
    let result = [...this.actors];

    if (options.query) {
      const query = options.query.toLowerCase();
      result = result.filter(actor => 
        actor.name.toLowerCase().includes(query)
      );
    }

    return this.findAll({ ...options, query: undefined, filters: undefined });
  }

  async create(entity: Omit<Actor, 'id'>): Promise<Actor> {
    const newActor: Actor = {
      ...entity,
      id: `actor_${Date.now()}`
    };
    this.actors.push(newActor);
    return newActor;
  }

  async update(id: string, entity: Partial<Actor>): Promise<Actor | null> {
    const index = this.actors.findIndex(actor => actor.id === id);
    if (index === -1) return null;

    this.actors[index] = { ...this.actors[index], ...entity };
    return this.actors[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.actors.findIndex(actor => actor.id === id);
    if (index === -1) return false;

    this.actors.splice(index, 1);
    return true;
  }
}

/**
 * Repository mockée pour les utilisateurs
 */
export class MockUserRepository implements Repository<UserData> {
  private users: UserData[] = [convertMockUserData()];

  async findById(id: string): Promise<UserData | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findAll(options?: QueryOptions): Promise<UserData[]> {
    return this.users;
  }

  async search(options: SearchOptions): Promise<UserData[]> {
    return this.users;
  }

  async create(entity: Omit<UserData, 'id'>): Promise<UserData> {
    const newUser: UserData = {
      ...entity,
      id: `user_${Date.now()}`
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, entity: Partial<UserData>): Promise<UserData | null> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;

    this.users[index] = { ...this.users[index], ...entity };
    return this.users[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }
}

/**
 * Repository mockée pour les activités utilisateur
 */
export class MockUserActivityRepository implements Repository<UserActivity> {
  private activities: UserActivity[] = [];

  async findById(id: string): Promise<UserActivity | null> {
    return this.activities.find(activity => activity.id === id) || null;
  }

  async findAll(options?: QueryOptions): Promise<UserActivity[]> {
    return this.activities;
  }

  async search(options: SearchOptions): Promise<UserActivity[]> {
    let result = [...this.activities];

    if (options.filters?.userId) {
      result = result.filter(activity => activity.userId === options.filters!.userId);
    }

    return result;
  }

  async create(entity: Omit<UserActivity, 'id'>): Promise<UserActivity> {
    const newActivity: UserActivity = {
      ...entity,
      id: `activity_${Date.now()}_${Math.random()}`
    };
    this.activities.push(newActivity);
    return newActivity;
  }

  async update(id: string, entity: Partial<UserActivity>): Promise<UserActivity | null> {
    const index = this.activities.findIndex(activity => activity.id === id);
    if (index === -1) return null;

    this.activities[index] = { ...this.activities[index], ...entity };
    return this.activities[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.activities.findIndex(activity => activity.id === id);
    if (index === -1) return false;

    this.activities.splice(index, 1);
    return true;
  }
}

/**
 * Repository graphe mockée
 */
export class MockGraphRepository implements GraphRepository {
  private movieRepository = new MockMovieRepository();

  async findConnections(nodeId: string, nodeType: string, depth: number = 2): Promise<GraphNode[]> {
    const nodes: GraphNode[] = [];
    
    if (nodeType === 'movie') {
      const movie = await this.movieRepository.findById(nodeId.replace('movie-', ''));
      if (!movie) return [];

      // Ajouter le nœud film
      nodes.push(this.createMovieNode(movie));

      // Ajouter les nœuds connectés
      movie.genres.forEach(genre => {
        nodes.push(this.createGenreNode(genre));
      });

      nodes.push(this.createDirectorNode(movie.director));

      movie.actors.forEach(actor => {
        nodes.push(this.createActorNode(actor));
      });
    }

    return nodes;
  }

  async findShortestPath(fromId: string, toId: string): Promise<GraphPath | null> {
    // Implémentation simplifiée pour la démo
    return null;
  }

  async findRecommendations(nodeIds: string[], options?: RecommendationOptions): Promise<RecommendationResult[]> {
    const movies = await this.movieRepository.findAll();
    const sourceMovies = await Promise.all(
      nodeIds.map(id => this.movieRepository.findById(id.replace('movie-', '')))
    );
    const validSourceMovies = sourceMovies.filter(Boolean) as Movie[];

    if (validSourceMovies.length === 0) return [];

    const recommendations: RecommendationResult[] = [];

    for (const movie of movies) {
      // Exclure les films sources et ceux dans excludeIds
      if (nodeIds.includes(`movie-${movie.id}`) || 
          options?.excludeIds?.includes(`movie-${movie.id}`)) {
        continue;
      }

      let totalScore = 0;
      const reasons: RecommendationReason[] = [];
      const path: GraphNode[] = [];

      for (const sourceMovie of validSourceMovies) {
        // Calcul des similarités (logique simplifiée)
        const genreOverlap = this.calculateGenreOverlap(movie, sourceMovie);
        if (genreOverlap > 0) {
          const weight = genreOverlap * (options?.weights?.genre || 0.3);
          totalScore += weight;
          reasons.push({
            type: 'genre',
            weight,
            description: `Partage des genres avec "${sourceMovie.title}"`,
            relatedNodes: [`movie-${sourceMovie.id}`]
          });
        }

        if (movie.director === sourceMovie.director) {
          const weight = options?.weights?.director || 0.25;
          totalScore += weight;
          reasons.push({
            type: 'director',
            weight,
            description: `Même réalisateur que "${sourceMovie.title}"`,
            relatedNodes: [`movie-${sourceMovie.id}`]
          });
        }

        const actorOverlap = this.calculateActorOverlap(movie, sourceMovie);
        if (actorOverlap > 0) {
          const weight = actorOverlap * (options?.weights?.actor || 0.2);
          totalScore += weight;
          reasons.push({
            type: 'actor',
            weight,
            description: `Partage des acteurs avec "${sourceMovie.title}"`,
            relatedNodes: [`movie-${sourceMovie.id}`]
          });
        }
      }

      if (totalScore >= (options?.minScore || 0)) {
        path.push(this.createMovieNode(movie));
        
        recommendations.push({
          nodeId: `movie-${movie.id}`,
          score: Math.min(totalScore, 1.0),
          reasons: reasons.sort((a, b) => b.weight - a.weight),
          path
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, options?.limit || 10);
  }

  private createMovieNode(movie: Movie): GraphNode {
    return {
      id: `movie-${movie.id}`,
      type: 'movie',
      label: movie.title,
      properties: { 
        year: movie.year, 
        rating: movie.rating,
        director: movie.director 
      },
      connections: []
    };
  }

  private createGenreNode(genre: string): GraphNode {
    return {
      id: `genre-${genre}`,
      type: 'genre',
      label: genre,
      properties: {},
      connections: []
    };
  }

  private createDirectorNode(director: string): GraphNode {
    return {
      id: `director-${director}`,
      type: 'director',
      label: director,
      properties: {},
      connections: []
    };
  }

  private createActorNode(actor: Actor): GraphNode {
    return {
      id: `actor-${actor.id}`,
      type: 'actor',
      label: actor.name,
      properties: { profilePicture: actor.profilePicture },
      connections: []
    };
  }

  private calculateGenreOverlap(movie1: Movie, movie2: Movie): number {
    const overlap = movie1.genres.filter(g => movie2.genres.includes(g)).length;
    const total = new Set([...movie1.genres, ...movie2.genres]).size;
    return overlap / total;
  }

  private calculateActorOverlap(movie1: Movie, movie2: Movie): number {
    const overlap = movie1.actors.filter(a1 => 
      movie2.actors.some(a2 => a2.id === a1.id)
    ).length;
    const total = new Set([
      ...movie1.actors.map(a => a.id),
      ...movie2.actors.map(a => a.id)
    ]).size;
    return overlap / total;
  }
}