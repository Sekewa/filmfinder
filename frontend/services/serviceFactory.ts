import { DatabaseManager, DatabaseConfig } from "./database";
import { MovieService, MovieServiceImpl, ActorService, ActorServiceImpl } from "./movieService";
import { UserService, UserServiceImpl } from "./userService";
import { 
  MockMovieRepository, 
  MockActorRepository, 
  MockUserRepository, 
  MockUserActivityRepository,
  MockGraphRepository 
} from "../repositories/mockRepository";

/**
 * Factory pour créer et configurer les services de l'application
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private dbManager: DatabaseManager;
  private movieService?: MovieService;
  private actorService?: ActorService;
  private userService?: UserService;

  private constructor(dbConfig: DatabaseConfig) {
    this.dbManager = DatabaseManager.getInstance(dbConfig);
  }

  static getInstance(dbConfig?: DatabaseConfig): ServiceFactory {
    if (!ServiceFactory.instance && dbConfig) {
      ServiceFactory.instance = new ServiceFactory(dbConfig);
    }
    return ServiceFactory.instance;
  }

  /**
   * Initialise la connexion à la base de données
   */
  async initialize(): Promise<void> {
    await this.dbManager.connect();
  }

  /**
   * Obtient le service des films
   */
  getMovieService(): MovieService {
    if (!this.movieService) {
      switch (this.dbManager.getConfig().type) {
        case 'mock':
          const movieRepo = new MockMovieRepository();
          const graphRepo = new MockGraphRepository();
          this.movieService = new MovieServiceImpl(movieRepo, graphRepo);
          break;
        
        case 'supabase':
          // TODO: Implémenter SupabaseMovieRepository
          throw new Error('Supabase repositories not implemented yet');
        
        case 'neo4j':
          // TODO: Implémenter Neo4jMovieRepository
          throw new Error('Neo4j repositories not implemented yet');
        
        default:
          throw new Error(`Unsupported database type: ${this.dbManager.getConfig().type}`);
      }
    }
    return this.movieService;
  }

  /**
   * Obtient le service des acteurs
   */
  getActorService(): ActorService {
    if (!this.actorService) {
      switch (this.dbManager.getConfig().type) {
        case 'mock':
          const actorRepo = new MockActorRepository();
          this.actorService = new ActorServiceImpl(actorRepo, this.getMovieService());
          break;
        
        case 'supabase':
          throw new Error('Supabase repositories not implemented yet');
        
        case 'neo4j':
          throw new Error('Neo4j repositories not implemented yet');
        
        default:
          throw new Error(`Unsupported database type: ${this.dbManager.getConfig().type}`);
      }
    }
    return this.actorService;
  }

  /**
   * Obtient le service utilisateur
   */
  getUserService(): UserService {
    if (!this.userService) {
      switch (this.dbManager.getConfig().type) {
        case 'mock':
          const userRepo = new MockUserRepository();
          const activityRepo = new MockUserActivityRepository();
          this.userService = new UserServiceImpl(userRepo, activityRepo);
          break;
        
        case 'supabase':
          throw new Error('Supabase repositories not implemented yet');
        
        case 'neo4j':
          throw new Error('Neo4j repositories not implemented yet');
        
        default:
          throw new Error(`Unsupported database type: ${this.dbManager.getConfig().type}`);
      }
    }
    return this.userService;
  }

  /**
   * Ferme toutes les connexions
   */
  async cleanup(): Promise<void> {
    await this.dbManager.disconnect();
    this.movieService = undefined;
    this.actorService = undefined;
    this.userService = undefined;
  }
}

/**
 * Configuration par défaut pour le développement
 */
export const defaultConfig: DatabaseConfig = {
  type: 'mock'
};

/**
 * Instance globale des services (singleton)
 */
let globalServiceFactory: ServiceFactory | null = null;

/**
 * Initialise les services avec la configuration donnée
 */
export async function initializeServices(config: DatabaseConfig = defaultConfig): Promise<ServiceFactory> {
  if (!globalServiceFactory) {
    globalServiceFactory = ServiceFactory.getInstance(config);
    await globalServiceFactory.initialize();
  }
  return globalServiceFactory;
}

/**
 * Obtient l'instance globale des services
 */
export function getServices(): ServiceFactory {
  if (!globalServiceFactory) {
    throw new Error('Services not initialized. Call initializeServices() first.');
  }
  return globalServiceFactory;
}

/**
 * Hooks pour React - facilitent l'utilisation des services dans les composants
 */
export function useMovieService(): MovieService {
  return getServices().getMovieService();
}

export function useActorService(): ActorService {
  return getServices().getActorService();
}

export function useUserService(): UserService {
  return getServices().getUserService();
}

/**
 * Nettoie les services (utile pour les tests)
 */
export async function cleanupServices(): Promise<void> {
  if (globalServiceFactory) {
    await globalServiceFactory.cleanup();
    globalServiceFactory = null;
  }
}