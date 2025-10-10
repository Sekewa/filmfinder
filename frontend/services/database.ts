/**
 * Interface de base pour les opérations de base de données
 */

export interface DatabaseConfig {
  type: 'mock' | 'supabase' | 'neo4j';
  connectionString?: string;
  apiKey?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface SearchOptions extends QueryOptions {
  query?: string;
  filters?: Record<string, any>;
}

/**
 * Interface générique pour les opérations CRUD
 */
export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<T[]>;
  search(options: SearchOptions): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Interface pour les opérations de graphe
 */
export interface GraphRepository {
  findConnections(nodeId: string, nodeType: string, depth?: number): Promise<GraphNode[]>;
  findShortestPath(fromId: string, toId: string): Promise<GraphPath | null>;
  findRecommendations(nodeIds: string[], options?: RecommendationOptions): Promise<RecommendationResult[]>;
}

export interface GraphNode {
  id: string;
  type: 'movie' | 'actor' | 'genre' | 'director';
  label: string;
  properties: Record<string, any>;
  connections: GraphEdge[];
}

export interface GraphEdge {
  id: string;
  type: string;
  weight: number;
  properties: Record<string, any>;
}

export interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalWeight: number;
}

export interface RecommendationOptions {
  limit?: number;
  minScore?: number;
  excludeIds?: string[];
  weights?: {
    genre?: number;
    director?: number;
    actor?: number;
    year?: number;
    rating?: number;
  };
}

export interface RecommendationResult {
  nodeId: string;
  score: number;
  reasons: RecommendationReason[];
  path: GraphNode[];
}

export interface RecommendationReason {
  type: string;
  weight: number;
  description: string;
  relatedNodes: string[];
}

/**
 * Gestionnaire de base de données
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private config: DatabaseConfig;
  
  private constructor(config: DatabaseConfig) {
    this.config = config;
  }
  
  static getInstance(config?: DatabaseConfig): DatabaseManager {
    if (!DatabaseManager.instance && config) {
      DatabaseManager.instance = new DatabaseManager(config);
    }
    return DatabaseManager.instance;
  }
  
  getConfig(): DatabaseConfig {
    return this.config;
  }
  
  async connect(): Promise<boolean> {
    // Implémentation spécifique selon le type de DB
    switch (this.config.type) {
      case 'mock':
        return true;
      case 'supabase':
        // Logique de connexion Supabase
        return true;
      case 'neo4j':
        // Logique de connexion Neo4j
        return true;
      default:
        throw new Error(`Database type ${this.config.type} not supported`);
    }
  }
  
  async disconnect(): Promise<void> {
    // Nettoyage des connexions
  }
}